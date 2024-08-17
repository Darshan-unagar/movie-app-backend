// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/users");
const adminMoviesRoute = require("./routes/admin/movies");
const adminUsersRoute = require("./routes/admin/users");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
  })

  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/movies", movieRoutes);
app.use("/users", userRoutes);

app.use("/admin/movies", adminMoviesRoute);
app.use("/admin/users", adminUsersRoute);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
