// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
const { sendWelcomeEmail } = require("../emailService");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Send a welcome email
    await sendWelcomeEmail(email, username);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create a payload with the user's ID and role
    const payload = {
      id: user._id,
      role: user.role, // Include user role in the token
    };

    // Generate a token with the payload
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send the token and role in the response
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("watchlist"); // Populate the watchlist with movie details
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update-password", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    // Check if the current password is correct
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Hash the new password before saving
    user.password = newPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-to-watchlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { movieId } = req.body;

    // Check if movie is already in watchlist
    if (user.watchlist.includes(movieId)) {
      return res.status(400).json({ message: "Movie is already in watchlist" });
    }

    user.watchlist.push(movieId);
    await user.save();

    res.json({ message: "Movie added to watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/remove-from-watchlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { movieId } = req.body;

    user.watchlist = user.watchlist.filter((id) => id.toString() !== movieId);
    await user.save();

    res.json({ message: "Movie removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
