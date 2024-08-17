const express = require("express");
const router = express.Router();
const Movie = require("../../models/Movies");
const adminAuthMiddleware = require("../../middleware/adminAuth");

// Get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get movie by id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new movie
router.post("/create", adminAuthMiddleware, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).send(movie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).send({ error: error.message });
  }
});
// Update a movie
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).send(movie);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete a movie
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
