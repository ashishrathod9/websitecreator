const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Connection management for serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 5,
      minPoolSize: 0,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });
    
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Register route with direct connection handling
router.post('/register', async (req, res) => {
  try {
    // Connect to database first
    await connectDB();
    
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Use direct MongoDB operations instead of Mongoose methods
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if user exists using native MongoDB driver
    const existingUser = await usersCollection.findOne(
      { email: email.toLowerCase().trim() }, 
      { 
        maxTimeMS: 10000,
        projection: { _id: 1 }
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
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date()
    };

    // Insert user using native MongoDB driver
    const result = await usersCollection.insertOne(userDoc, {
      maxTimeMS: 10000
    });

    if (!result.insertedId) {
      throw new Error('Failed to create user');
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertedId,
        name: userDoc.name,
        email: userDoc.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (error.name === 'MongoTimeoutError' || 
        error.message.includes('timeout') || 
        error.message.includes('buffering')) {
      return res.status(503).json({
        error: 'Database connection timeout. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    if (error.message === 'MONGODB_URI not found') {
      return res.status(500).json({
        error: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Login route with direct connection handling
router.post('/login', async (req, res) => {
  try {
    // Connect to database first
    await connectDB();
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use direct MongoDB operations
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find user using native MongoDB driver
    const user = await usersCollection.findOne(
      { email: email.toLowerCase().trim() },
      { maxTimeMS: 10000 }
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
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error.name === 'MongoTimeoutError' || 
        error.message.includes('timeout') || 
        error.message.includes('buffering')) {
      return res.status(503).json({
        error: 'Database connection timeout. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    res.status(500).json({
      error: 'Login failed. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;