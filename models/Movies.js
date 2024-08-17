const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: [{ type: String, required: true }],
  director: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  coverImage: { type: String },
  trailerUrl: { type: String },
  story: { type: String }, 
  images: [{ type: String }],
  reviews: [reviewSchema],
  imdbRating: { type: Number }, 
  stars: { type: [String] }, 
  language: { type: String }, 
  videoUrl: { type: String }, 
}, {
  timestamps: true,
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
