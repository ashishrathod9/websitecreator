const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS
app.use(cors({
  origin: [
    'https://websitecreator-ttdr.vercel.app',
    'https://websitecreator-cgzt.vercel.app',
    'https://websitecreator-4.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// MongoDB options (fixed: removed unsupported bufferMaxEntries)
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  maxPoolSize: 5,
  minPoolSize: 0,
  bufferCommands: false
  // ✅ bufferMaxEntries removed
};

// MongoDB connection function
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in .env');

    await mongoose.connect(uri, mongooseOptions);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Routes (only use if these files exist)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));

// Health check
app.get('/health', (req, res) => {
  const status = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState];
  res.json({ db: status });
});

// Start server after DB connects
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
