const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3000", "http://your-frontend-domain.com"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/signup', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if (await User.findOne({ username })) {
            return res.status(400).json({ error: "Username already taken." });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, phone, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: '🎉 Signup successful!' });
    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ error: "Signup failed. Try again later." });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ 
            token, 
            username: user.username,
            email: user.email,
            message: '✅ Login successful!' 
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: 'Login failed. Try again later.' });
    }
});

app.post('/request', async (req, res) => {
    try {
        const { phone, type, requirements, username } = req.body;
        // Add your request handling logic here
        res.status(200).json({ message: "Request received" });
    } catch (error) {
        res.status(500).json({ error: "Request processing failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});



// server.js (INSECURE CONFIGURATION - NOT FOR PRODUCTION)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ===== HARDCODED CONFIGURATION (INSECURE) =====
const INSECURE_CONFIG = {
  MONGO_URI: 'mongodb+srv://pubghearbeat:qL4uaj9moZeVGm1v@clusterforcodethereper.60yo9.mongodb.net/?retryWrites=true&w=majority&appName=clusterforcodethereper',
  JWT_SECRET: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInVzZXJuYW1lIjoibXVzdGFmYSIsImlhdCI6MTc0MTU0Nzc4OCwiZXhwIjoxNzQxNTUxMzg4fQ.raBqOrz7wn9YjyGAgyoEdarjcW5pS_Exzu_yFDgIXQo',
  FRONTEND_URL: 'https://www-code-reaper-com.onrender.com',
  PORT: 5000
};

// ===== DATABASE CONNECTION =====
mongoose.connect(INSECURE_CONFIG.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== MIDDLEWARE =====
app.use(cors({
  origin: INSECURE_CONFIG.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// ===== MODELS =====
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
}));

// ===== ROUTES =====
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (await User.findOne({ $or: [{ username }, { email }] })) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign(
      { userId: user._id },
      INSECURE_CONFIG.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, username });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      INSECURE_CONFIG.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== START SERVER =====
app.listen(INSECURE_CONFIG.PORT, () => {
  console.log(`🚀 Server running on port ${INSECURE_CONFIG.PORT}`);
  console.log(`⚠️  WARNING: INSECURE CONFIGURATION - DO NOT USE IN PRODUCTION`);
});
