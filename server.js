const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "b442349f670dcf6981d837ea0bf4ee0cc7c5cc7b25ada5c2d1f71f7f6ea02d901dabc7be7007c4d711804055838095bc13d1935b659d77bdab508770a50c2dd1";

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3000", "https://www-code-reaper-com.onrender.com"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static('public'));

// ===== Connect to MongoDB Atlas =====
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Codereper:75iM273Z4nOh1r0J@website2.v6oux.mongodb.net/?retryWrites=true&w=majority&appName=Website2", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Define User Schema =====
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// ===== Signup Route =====
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

// ===== Login Route =====
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

        res.json({ token, username: user.username, message: '✅ Login successful!' });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: 'Login failed. Try again later.' });
    }
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
