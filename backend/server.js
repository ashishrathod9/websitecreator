const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

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

// Improved MongoDB connection options for Vercel
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Reduced timeout for faster failure detection
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000, // Reduced idle time
  retryWrites: true,
  w: 'majority',
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
};

// Global connection variable
let cachedDb = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Check if we already have a connection
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log('Using cached MongoDB connection');
      return cachedDb;
    }

    // Close existing connection if it's in a bad state
    if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
      await mongoose.connection.close();
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, mongooseOptions);
    
    cachedDb = mongoose.connection;
    console.log('Connected to MongoDB successfully');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    cachedDb = null;
    throw err;
  }
};

// Connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cachedDb = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedDb = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  cachedDb = mongoose.connection;
});

// Middleware to ensure connection before handling requests
const ensureConnection = async (req, res, next) => {
  try {
    if (!cachedDb || mongoose.connection.readyState !== 1) {
      console.log('Reconnecting to MongoDB...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({ 
      error: 'Database connection failed', 
      message: 'Please try again in a moment' 
    });
  }
};

// Apply connection middleware to API routes
app.use('/api', ensureConnection);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({ 
      status: 'ok',
      database: {
        state: states[dbState],
        ready: dbState === 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: { state: 'error', ready: false }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'College Website Generator API is running' });
});

// Initialize connection
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err);
  // Don't exit process in serverless environment
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Handle serverless function cleanup
if (process.env.VERCEL) {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing MongoDB connection...');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Handle MongoDB specific errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    return res.status(503).json({ 
      error: 'Database connection issue', 
      message: 'Please try again in a moment' 
    });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;