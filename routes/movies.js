const express = require("express");
const router = express.Router();
const Movie = require("../models/Movies");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");

const getUserId = (req) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using your secret
    return decoded._id; // Return the user ID from the decoded token
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Create a movie
router.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a random featured movie
router.get("/featured-random", async (req, res) => {
  try {
    const count = await Movie.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const movie = await Movie.findOne().skip(randomIndex);

    if (!movie) return res.status(404).json({ error: "No movie found" });

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search movies by title
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const movies = await Movie.find({
      title: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get distinct genres
router.get("/category", async (req, res) => {
  try {
    const genres = await Movie.distinct("genre");
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get movies by genre
router.get("/category/:genre", async (req, res) => {
  try {
    const genre = req.params.genre;
    const movies = await Movie.find({ genre });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a specific movie
router.get("/:id/reviews", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select("reviews");
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie.reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/reviews", async (req, res) => {
  try {
    // Extract the movie ID from the URL parameters
    const movieId = req.params.id;

    // Find the movie by ID
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Decode the JWT to get the user information
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database to get the username
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new review object
    const newReview = {
      content: req.body.content,
      username: user.username, // Use the username from the User model
      userId: user._id, // Use the user ID from the User model
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    };

    // Push the new review to the reviews array
    movie.reviews.push(newReview);

    // Save the updated movie document
    await movie.save();

    // Return the new review
    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:movieId/reviews/:reviewId/like", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const review = movie.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.likedBy.includes(user._id)) {
      review.likes--;
      review.likedBy.pull(user._id);
    } else {
      review.likes++;
      review.likedBy.push(user._id);
      review.dislikes = review.dislikedBy.includes(user._id)
        ? review.dislikes - 1
        : review.dislikes;
      review.dislikedBy.pull(user._id);
    }

    await movie.save();
    res
      .status(200)
      .json({
        likes: review.likes,
        dislikes: review.dislikes,
        likedBy: review.likedBy,
        dislikedBy: review.dislikedBy,
      });
  } catch (error) {
    console.error("Error liking review:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/:movieId/reviews/:reviewId/dislike", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const review = movie.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.dislikedBy.includes(user._id)) {
      review.dislikes--;
      review.dislikedBy.pull(user._id);
    } else {
      review.dislikes++;
      review.dislikedBy.push(user._id);
      review.likes = review.likedBy.includes(user._id)
        ? review.likes - 1
        : review.likes;
      review.likedBy.pull(user._id);
    }

    await movie.save();
    res
      .status(200)
      .json({
        likes: review.likes,
        dislikes: review.dislikes,
        likedBy: review.likedBy,
        dislikedBy: review.dislikedBy,
      });
  } catch (error) {
    console.error("Error disliking review:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
