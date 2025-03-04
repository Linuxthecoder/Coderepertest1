const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// 🔧 Enable CORS
app.use(cors({
    origin: ["http://localhost:3000", "https://www-code-reaper-com.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static('public'));

// 📡 MongoDB Connection
mongoose.set('strictQuery', true);
mongoose.set('debug', true); // Logs MongoDB queries for debugging

mongoose.connect(process.env.MONGO_URI || "your_mongo_connection_string_here")
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🏛️ Schemas & Models
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

const WebsiteRequestSchema = new mongoose.Schema({
    username: String,
    phone: String,
    type: String,
    requirements: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
});

const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const WebsiteRequest = mongoose.model('WebsiteRequest', WebsiteRequestSchema);
const Contact = mongoose.model('Contact', ContactSchema);

// 🔑 Middleware: Verify JWT Token
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

// 🔹 SIGNUP Route
app.post('/signup', async (req, res) => {
    try {
        console.log("📩 Signup request received:", req.body);

        const { username, password, email, phone } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ error: "All fields are required." });
        }

        if (await User.findOne({ username })) {
            return res.status(400).json({ error: "Username already taken." });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email, phone });

        await newUser.save();
        console.log("✅ New user registered:", newUser);

        res.status(201).json({ message: '🎉 User registered successfully!' });
    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ error: "Registration failed. Try again later." });
    }
});

// 🔹 LOGIN Route
app.post('/login', async (req, res) => {
    try {
        console.log("🔑 Login request received:", req.body);
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });

        res.json({ token, username: user.username, message: '✅ Login successful!' });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: 'Server error. Try again later.' });
    }
});

// 🔹 Website Request (Protected)
app.post('/request', verifyToken, async (req, res) => {
    try {
        console.log("📨 Website request received:", req.body);

        const newRequest = new WebsiteRequest({
            username: req.user.username,
            phone: req.body.phone,
            type: req.body.type,
            requirements: req.body.requirements
        });

        await newRequest.save();
        res.status(201).json({ message: "🎯 Website request submitted successfully!" });
    } catch (error) {
        console.error("❌ Request error:", error);
        res.status(500).json({ error: "Error processing request. Please try again." });
    }
});

// 🔹 Contact Form Submission
app.post('/contact', async (req, res) => {
    try {
        console.log("📩 Contact form submitted:", req.body);

        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });

        await newContact.save();
        res.status(201).json({ message: '📩 Message received successfully!' });
    } catch (error) {
        console.error("❌ Contact error:", error);
        res.status(500).json({ error: 'Error submitting message. Try again later.' });
    }
});

// 🔹 GET Users (For Testing)
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password for security
        res.json(users);
    } catch (error) {
        console.error("❌ Fetch users error:", error);
        res.status(500).json({ error: "Error retrieving users." });
    }
});

// 🚀 Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
