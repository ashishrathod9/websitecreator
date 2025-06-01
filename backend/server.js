const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// MongoDB connection configuration
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 30000, // Increase connection timeout
      maxPoolSize: 10, // Increase connection pool size
      minPoolSize: 5, // Maintain minimum connections
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit with failure
  }
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: [
    'https://websitecreator-ttdr.vercel.app',
    'https://websitecreator-cgzt.vercel.app',
    'https://websitecreator-4.onrender.com',
    'https://websitecreator-12.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

// Remove the connection middleware completely for Vercel
// Each route will handle its own connection

// Routes - direct mounting without middleware
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));

// Health check - simplified
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'College Website Generator API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Export for Vercel - no local server setup
module.exports = app;