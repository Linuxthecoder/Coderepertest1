const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "593e94c2815964e7305effeec7cbf3bdae46825be31aa78adcafe60c1010606ff3bdd100661a149667b033156b016fb45a2114d4b8154edf454a70783a201d1a";

// Apply security headers using Helmet
app.use(helmet());

// Rate limiting middleware (to prevent brute-force attacks)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3000", "https://www-code-reaper-com.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Codereper:bfJIZDDuL2jxxRxZ@website2.v6oux.mongodb.net/?retryWrites=true&w=majority&appName=Website2", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Mongoose schemas and models (User, WebsiteRequest, etc.)
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    createdAt: { type: Date, default: Date.now }
}));

const WebsiteRequest = mongoose.model('WebsiteRequest', new mongoose.Schema({
    username: String,
    phone: String,
    type: String,
    requirements: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
}));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// Authentication Routes (Signup, Login)
app.post('/signup', [
    body('username').isAlphanumeric().trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, phone } = req.body;
    if (await User.findOne({ username }) || await User.findOne({ email })) {
        return res.status(400).json({ error: "Username or Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email, phone });
    await newUser.save();
    res.status(201).json({ message: '🎉 User registered successfully!' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username, message: '✅ Login successful!' });
});

// Protected Website Request Endpoint
app.post('/request', verifyToken, async (req, res) => {
    const { phone, type, requirements } = req.body;
    const newRequest = new WebsiteRequest({
        username: req.user.username,
        phone,
        type,
        requirements
    });
    await newRequest.save();
    res.status(201).json({ message: "🎯 Website request submitted successfully!" });
});

// Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
