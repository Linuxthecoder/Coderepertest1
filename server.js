// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ===== Configuration =====
const config = {
  MONGO_URI: 'mongodb+srv://pubghearbeat:qL4uaj9moZeVGm1v@clusterforcodethereper.60yo9.mongodb.net/?retryWrites=true&w=majority&appName=clusterforcodethereper',
  JWT_SECRET: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInVzZXJuYW1lIjoibXVzdGFmYSIsImlhdCI6MTc0MTU0Nzc4OCwiZXhwIjoxNzQxNTUxMzg4fQ.raBqOrz7wn9YjyGAgyoEdarjcW5pS_Exzu_yFDgIXQo',
  FRONTEND_URL: 'https://www-code-reaper-com.onrender.com',
  PORT: process.env.PORT || 5000
};

// ===== Database Models =====
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const websiteRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String, required: true },
  websiteType: { type: String, required: true },
  requirements: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const WebsiteRequest = mongoose.model('WebsiteRequest', websiteRequestSchema);

// ===== Database Connection =====
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Middleware =====
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Add this after CORS middleware
app.use(express.static('public'));  // Serve static files from 'public' directory

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== Routes =====
// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already registered'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ token, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Website Request Route (Protected)
app.post('/api/requests', protect, async (req, res) => {
  try {
    const { phone, websiteType, requirements } = req.body;

    const newRequest = await WebsiteRequest.create({
      user: req.user._id,
      phone,
      websiteType,
      requirements
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// ===== Start Server =====
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
});
