const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const userRoutes = require('./routes/user.routes');
const searchRoutes = require('./routes/search.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Batdongsan Clone API');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/batdongsan-clone';

// Start server regardless of MongoDB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Try to connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Running with mock data instead');
  });

// Mock user endpoint for testing when MongoDB is not available
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Simple mock authentication
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      _id: '123456789',
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      role: 'user',
      token: 'mock-token-for-testing'
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Mock user profile endpoint
app.get('/api/auth/profile', (req, res) => {
  // Check for the mock token
  const authHeader = req.headers.authorization || '';
  if (authHeader.includes('mock-token-for-testing')) {
    res.json({
      _id: '123456789',
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      address: 'Test Address',
      role: 'user'
    });
  } else {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
});
