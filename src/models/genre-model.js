const Joi = require('joi');
const mongoose = require('mongoose');

// Genre schema
const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  }
});

// Genre model
const Genre = mongoose.model('Genre', genreSchema);

// Validation genre schema
function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required()
  });

  return schema.validate(genre);
}

module.exports = { genreSchema, Genre, validateGenre };
