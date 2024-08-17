const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        _id: user._id,
        username: user.username,
        role: user.role,
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET, // Ensure this is correctly set
        { expiresIn: '5h' }    // Token expiration time
    );
};

module.exports = generateToken;
