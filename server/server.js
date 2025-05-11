require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user');

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced MongoDB connection with retry logic
const connectWithRetry = () => {
  console.log('Attempting MongoDB connection...');
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Middleware to check DB connection before handling requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected',
      solution: 'Please try again in a few moments'
    });
  }
  next();
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Improved signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, pattern } = req.body;
    
    // Validate input
    if (!email || !pattern) {
      return res.status(400).json({ error: 'Email and pattern are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already exists',
        field: 'email'
      });
    }

    const newUser = new User({ 
      email, 
      graphicalPattern: JSON.stringify(pattern)
    });
    
    await newUser.save();
    res.status(201).json({ 
      message: 'User created successfully',
      user: { email: newUser.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Improved signin route
app.post('/api/signin', async (req, res) => {
  try {
    const { email, pattern } = req.body;
    
    // Validate input
    if (!email || !pattern) {
      return res.status(400).json({ 
        error: 'Email and pattern are required',
        field: !email ? 'email' : 'pattern'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        field: 'email'
      });
    }

    // Compare stringified patterns
    const inputPattern = JSON.stringify(pattern);
    if (user.graphicalPattern !== inputPattern) {
      console.log('Pattern mismatch:', { 
        expected: user.graphicalPattern, 
        received: inputPattern 
      });
      return res.status(401).json({ 
        error: 'Invalid pattern',
        field: 'pattern'
      });
    }

    res.json({ 
      message: 'Login successful',
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});