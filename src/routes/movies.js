const express = require('express');
const { Movie, validateMovie } = require('../models/movie-model');
const { Genre } = require('../models/genre-model');
const auth = require('../middleware/auth-middleware');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

const router = express.Router();

// Getting all movies
router.get('/', async (req, res) => {
  const movie = await Movie.find().sort('name').exec();

  res.send(movie);
});

// Getting especific movie
router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

// Creating a movie
router.post('/', [auth, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const movie = new Movie({
    title: req.body.title,
    genre: { _id: genre._id, name: genre.name },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });
  const document = await movie.save();

  res.send(document);
});

// Updating movie
router.put('/:id', [auth, validateObjectId, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  movie.genre = { _id: genre._id, name: genre.name };
  movie.numberInStock = req.body.numberInStock ? req.body.numberInStock : movie.numberInStock;
  movie.dailyRentalRate = req.body.dailyRentalRate
    ? req.body.dailyRentalRate
    : movie.dailyRentalRate;

  const document = await movie.save();

  res.send(document);
});

// Deleting a movie
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;
