const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const router = express.Router();

// MongoDB client instance
let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 30000,
  });

  try {
    await client.connect();
    const db = client.db(); // Uses database from connection string
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Register route using pure MongoDB driver
router.post('/register', async (req, res) => {
  let client = null;
  
  try {
    // Connect to database
    const { client: mongoClient, db } = await connectToDatabase();
    client = mongoClient;
    
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const usersCollection = db.collection('users');
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists - pure MongoDB operation
    const existingUser = await usersCollection.findOne(
      { email: normalizedEmail },
      { 
        projection: { _id: 1 },
        maxTimeMS: 8000 
      }
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document
    const userDoc = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user - pure MongoDB operation
    const insertResult = await usersCollection.insertOne(userDoc, {
      maxTimeMS: 8000
    });

    if (!insertResult.acknowledged || !insertResult.insertedId) {
      throw new Error('Failed to create user');
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: insertResult.insertedId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: insertResult.insertedId.toString(),
        name: userDoc.name,
        email: userDoc.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Email already exists',
        code: 'DUPLICATE_EMAIL'
      });
    }

    // Handle timeout errors
    if (error.name === 'MongoTimeoutError' || 
        error.message.includes('timeout') ||
        error.message.includes('timed out')) {
      return res.status(503).json({
        error: 'Database operation timed out. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    // Handle connection errors
    if (error.name === 'MongoServerSelectionError' ||
        error.name === 'MongoNetworkError') {
      return res.status(503).json({
        error: 'Database connection failed. Please try again.',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    // Handle configuration errors
    if (error.message.includes('MONGODB_URI') || 
        error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        error: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Registration failed. Please try again.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route using pure MongoDB driver
router.post('/login', async (req, res) => {
  let client = null;
  
  try {
    // Connect to database
    const { client: mongoClient, db } = await connectToDatabase();
    client = mongoClient;
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersCollection = db.collection('users');
    const normalizedEmail = email.toLowerCase().trim();

    // Find user - pure MongoDB operation
    const user = await usersCollection.findOne(
      { email: normalizedEmail },
      { maxTimeMS: 8000 }
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    // Handle timeout errors
    if (error.name === 'MongoTimeoutError' || 
        error.message.includes('timeout') ||
        error.message.includes('timed out')) {
      return res.status(503).json({
        error: 'Database operation timed out. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    // Handle connection errors
    if (error.name === 'MongoServerSelectionError' ||
        error.name === 'MongoNetworkError') {
      return res.status(503).json({
        error: 'Database connection failed. Please try again.',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    // Handle configuration errors
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        error: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Login failed. Please try again.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for auth routes
router.get('/health', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Test database connection
    await db.admin().ping();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;