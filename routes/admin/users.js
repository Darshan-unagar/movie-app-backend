const express = require("express");
const router = express.Router();
const User = require("../../models/User");
console.log(User);
const adminAuth = require("../../middleware/adminAuth");

// Get all users
router.get("/", adminAuth, async (req, res) => {
  try {
    // Find users with role 'user', excluding those with role 'admin'
    const users = await User.find({ role: "user" });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error); // Changed to console.error for better error logging
  }
});

// Get a single user by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
});
// Update user role (e.g., upgrade to admin)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete a user
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
