const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'https://websitecreator-navy.vercel.app',
    'https://websitecreator-12.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Disable buffering so that operations don't queue before DB connects
mongoose.set('bufferCommands', false);

// Connection options (no deprecated ones)
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 10000
};

// Connect and then load routes
const startServer = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('❌ MONGODB_URI is not defined in .env');
    await mongoose.connect(uri, mongooseOptions);
    console.log('✅ MongoDB connected');

    // ✅ Only load routes after DB connection is successful
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/colleges', require('./routes/colleges'));
    app.use('/api/templates', require('./routes/templates'));

    // Health check route
    app.get('/health', (req, res) => {
      const status = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState];
      res.json({ db: status });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
