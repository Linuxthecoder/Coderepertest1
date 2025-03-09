// server.js (Improved Version)
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ===== Configuration =====
const config = {
  MONGO_URI: 'mongodb+srv://pubghearbeat:qL4uaj9moZeVGm1v@clusterforcodethereper.60yo9.mongodb.net/code-reaper?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'X5$8qL!9nT2vW#zY*KpF7aDhGmRjSd4w6cVbN3eZrCtYxUvIuHkOlPqAsBfJgM1oIi', // Use environment variable
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://www-code-reaper-com.onrender.com',
  PORT: process.env.PORT || 5000
};

// ===== Database Models =====
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, index: true },
  email: { type: String, unique: true, required: true, index: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const websiteRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  phone: { type: String, required: true },
  websiteType: { type: String, required: true },
  requirements: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Completed'] },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
websiteRequestSchema.index({ createdAt: -1 });
websiteRequestSchema.index({ user: 1, status: 1 });

const User = mongoose.model('User', userSchema);
const WebsiteRequest = mongoose.model('WebsiteRequest', websiteRequestSchema);

// ===== Database Connection =====
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// ===== Middleware =====
app.use(cors({
  origin: config.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== Enhanced Authentication Middleware =====
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ 
      success: false,
      error: 'Authorization token missing' 
    });

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) return res.status(401).json({ 
      success: false,
      error: 'User not found' 
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
};

// ===== Routes =====
// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date()
  });
});

// Signup Route (Improved Validation)
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Enhanced Validation
    const errors = [];
    if (!username) errors.push('Username is required');
    if (!email) errors.push('Email is required');
    if (!phone) errors.push('Phone number is required');
    if (!password) errors.push('Password is required');
    
    if (errors.length > 0) return res.status(400).json({ 
      success: false,
      errors 
    });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      username, 
      email, 
      phone, 
      password: hashedPassword 
    });

    const token = jwt.sign(
      { userId: user._id }, 
      config.JWT_SECRET, 
      { expiresIn: '2h' }
    );

    res.status(201).json({ 
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Login Route (Improved Error Messages)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      config.JWT_SECRET, 
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Website Request Route (Enhanced)
app.post('/api/requests', protect, async (req, res) => {
  try {
    const { phone, websiteType, requirements } = req.body;

    // Detailed Validation
    const errors = [];
    if (!phone) errors.push('Phone number is required');
    if (!websiteType) errors.push('Website type is required');
    if (!requirements) errors.push('Requirements are required');
    
    if (errors.length > 0) return res.status(400).json({
      success: false,
      errors
    });

    const newRequest = await WebsiteRequest.create({
      user: req.user._id,
      phone,
      websiteType,
      requirements
    });

    res.status(201).json({
      success: true,
      request: {
        id: newRequest._id,
        phone: newRequest.phone,
        websiteType: newRequest.websiteType,
        requirements: newRequest.requirements,
        status: newRequest.status,
        createdAt: newRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create request' 
    });
  }
});

// Client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Start Server =====
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 
