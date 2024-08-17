const express = require('express');
const router = express.Router();
const { User } = require('../../models/User');
const adminAuth = require('../../middleware/adminAuth');

// Get all users
router.get('/', adminAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update user role (e.g., upgrade to admin)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a user
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
