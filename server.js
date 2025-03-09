const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Added to serve static files

// Initialize the app and middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Direct configuration values
const JWT_SECRET = "b442349f670dcf6981d837ea0bf4ee0cc7c5cc7b25ada5c2d1f71f7f6ea02d901dabc7be7007c4d711804055838095bc13d1935b659d77bdab508770a50c2dd1"; // Replace with a stronger secret

// MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://Codereper:bfJIZDDuL2jxxRxZ@website2.v6oux.mongodb.net/?retryWrites=true&w=majority&appName=Website2"; // Replace with your MongoDB Atlas URI

// Database connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

// User model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
});

const User = mongoose.model("User", UserSchema);

// Website Request model
const WebsiteRequestSchema = new mongoose.Schema({
    username: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true },
    requirements: { type: String, required: true },
});

const WebsiteRequest = mongoose.model("WebsiteRequest", WebsiteRequestSchema);

// API Routes
app.use(express.static('public'));

// Root path to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
    const { username, password, email, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
        username,
        password: hashedPassword,
        email,
        phone,
    });

    try {
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Signup failed" });
    }
});

// Login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
});

// Website Request route
app.post("/request", async (req, res) => {
    const { phone, type, requirements, username } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.username !== username) {
            return res.status(403).json({ error: "Invalid token user" });
        }

        // Create a new website request
        const newRequest = new WebsiteRequest({
            username,
            phone,
            type,
            requirements,
        });

        await newRequest.save();
        res.status(201).json({ message: "Request submitted successfully" });
    } catch (error) {
        console.error("Request error:", error);
        res.status(500).json({ error: "An error occurred, please try again" });
    }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
