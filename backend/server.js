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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'College Website Generator API is running' });
});

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased from 5000 to 30000
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // Increased from 10000 to 30000
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  w: 'majority'
};

// Global connection variable
let cachedDb = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // If we have a cached connection, return it
    if (cachedDb) {
      return cachedDb;
    }

    // For serverless environments
    if (process.env.VERCEL) {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri, mongooseOptions);
        cachedDb = mongoose.connection;
      }
    } else {
      // For regular environments
      await mongoose.connect(uri, mongooseOptions);
      cachedDb = mongoose.connection;
    }

    console.log('Connected to MongoDB successfully');
    console.log('MongoDB connection state:', { state: mongoose.connection.readyState });
  } catch (err) {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check if:', {
        checks: [
          'The server is running and accessible',
          'The connection string is correct',
          'Network connectivity is available'
        ]
      });
    } else if (err.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your MONGODB_URI environment variable.');
    } else if (err.name === 'MongoNetworkError') {
      console.error('Network error while connecting to MongoDB. Please check your network connection.');
    }
    process.exit(1);
  }
};

// Call connectDB
connectDB();

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Handle serverless function cleanup
if (process.env.VERCEL) {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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