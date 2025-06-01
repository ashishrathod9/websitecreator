const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: ['https://websitecreator-ttdr.vercel.app', 'https://websitecreator-cgzt.vercel.app', 'https://websitecreator-4.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// MongoDB connection options optimized for serverless
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // Reduced for faster failure
  socketTimeoutMS: 20000, // Reduced timeout
  connectTimeoutMS: 15000, // Reduced timeout
  maxPoolSize: 5, // Reduced for serverless
  minPoolSize: 0, // Allow scaling to zero
  maxIdleTimeMS: 30000, // Reduced idle time
  retryWrites: true,
  w: 'majority',
  bufferCommands: false, // Keep disabled
  bufferMaxEntries: 0, // Keep disabled
  heartbeatFrequencyMS: 10000, // More frequent heartbeat
};

// Connection state management
let connectionPromise = null;
let isConnected = false;

const connectDB = async () => {
  // Return existing connection promise if already connecting
  if (connectionPromise) {
    return connectionPromise;
  }

  // Return immediately if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Initiating MongoDB connection...');
    
    // Close any existing connections in bad state
    if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
      await mongoose.disconnect();
    }

    // Create connection promise
    connectionPromise = mongoose.connect(uri, mongooseOptions);
    
    await connectionPromise;
    
    isConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connected successfully');
    
    // Reset promise after successful connection
    connectionPromise = null;
    
    return Promise.resolve();
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnected = false;
    connectionPromise = null;
    throw err;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isConnected = false;
  connectionPromise = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  isConnected = false;
  connectionPromise = null;
});

// Improved middleware to ensure database connection
const ensureConnection = async (req, res, next) => {
  const maxRetries = 2;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Check connection state
      if (isConnected && mongoose.connection.readyState === 1) {
        return next();
      }

      console.log(`Database connection attempt ${retries + 1}/${maxRetries}`);
      await connectDB();
      
      // Double-check connection is ready
      if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return next();
      }
      
      throw new Error('Connection established but not ready');
      
    } catch (error) {
      retries++;
      console.error(`Connection attempt ${retries} failed:`, error.message);
      
      if (retries >= maxRetries) {
        console.error('Max connection retries exceeded');
        return res.status(503).json({ 
          error: 'Database service temporarily unavailable', 
          details: 'Please try again in a moment',
          code: 'DB_CONNECTION_FAILED'
        });
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Apply connection middleware to API routes only
app.use('/api', ensureConnection);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const status = {
      status: 'ok',
      database: {
        state: stateNames[dbState] || 'unknown',
        isConnected: isConnected && dbState === 1
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Test database connectivity
    if (dbState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        status.database.ping = 'successful';
      } catch (pingError) {
        status.database.ping = 'failed';
        status.database.pingError = pingError.message;
      }
    }

    const httpStatus = (dbState === 1 && status.database.ping === 'successful') ? 200 : 503;
    res.status(httpStatus).json(status);
    
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'College Website Generator API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Graceful shutdown handling for serverless
const gracefulShutdown = async () => {
  console.log('Initiating graceful shutdown...');
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    isConnected = false;
    connectionPromise = null;
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
};

// Handle various shutdown signals
if (process.env.VERCEL) {
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  // Vercel-specific cleanup
  process.on('beforeExit', gracefulShutdown);
}

// Initialize connection for non-serverless environments only
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connectDB().catch(err => {
    console.error('Failed to initialize MongoDB connection:', err);
    process.exit(1);
  });
}

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Handle specific error types
  if (err.name === 'MongoTimeoutError' || err.name === 'MongooseError') {
    return res.status(503).json({
      error: 'Database service temporarily unavailable',
      code: 'DB_TIMEOUT'
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: 'VALIDATION_ERROR'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    code: 'INTERNAL_ERROR'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
module.exports = app;