require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user');

const app = express();
app.use(cors());
app.use(express.json());

// Improved MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

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
      graphicalPattern: JSON.stringify(pattern) // Stringify pattern
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
      console.log('Invalid pattern:', user.graphicalPattern, inputPattern);
      return res.status(401).json({ 
        error: `Pattern mismatch!<br><br>
                Stored: ${storedPattern}<br>
                Entered: ${inputPattern}<br><br>
                (Compare these in console for exact difference)`,
        field: 'pattern',
        debug: {
          storedPattern,
          inputPattern
        }
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});