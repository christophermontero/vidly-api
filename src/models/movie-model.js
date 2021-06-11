const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre-model');

// Movie Model
const Movie = mongoose.model(
  'Movie',
  new mongoose.Schema({
    title: {
      type: String,
      minlength: 2,
      maxlength: 50,
      trim: true,
      lowercase: true,
      required: true
    },
    genre: {
      type: genreSchema,
      required: true
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    }
  })
);

// Validate movie schema
function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(50),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255),
    dailyRentalRate: Joi.number().min(0).max(255)
  });

  return schema.validate(movie);
}

module.exports = { Movie, validateMovie };
