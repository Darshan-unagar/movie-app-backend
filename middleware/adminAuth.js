const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuthMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).send({ error: "Access denied. Admins only." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({ error: "Token expired" });
    }
    console.error("Token validation error:", error);
    res.status(401).send({ error: "Invalid token" });
  }
};

module.exports = adminAuthMiddleware;
