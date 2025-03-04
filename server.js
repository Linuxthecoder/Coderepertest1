const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "25f9f32ec38291b4dca8f6485232e4696cbcc2b934155f241cc42c44ebf936e64236205667e14811acac7095ba69e474ec340691578d2c5a9927a28f8c037280";

// 🔧 Enable CORS
app.use(cors({
    origin: ["http://localhost:3000", "https://www-code-reaper-com.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Allow form data parsing
app.use(express.static('public'));

// 📡 MongoDB Connection
mongoose.set('strictQuery', true);
mongoose.set('debug', true);

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Codereper:75iM273Z4nOh1r0J@website2.v6oux.mongodb.net/?retryWrites=true&w=majority&appName=Website2")
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🏛️ Schemas & Models
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

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

// ✅ SIGNUP Route
app.post('/signup', async (req, res) => {
    try {
        console.log("📩 Signup request received:", req.body);

        const { username, password, email, phone } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, password, and email are required." });
        }

        // Validate Email Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "Username or email already taken." });
        }

        // Hash the password
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

// ✅ LOGIN Route
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

// ✅ GET Users (For Testing)
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
