const express = require('express');
const { Genre, validateGenre } = require('../models/genre-model');
const auth = require('../middleware/auth-middleware');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Getting all genres
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name').exec();

  res.send(genres);
});

// Getting especific genre
router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

// Creating a genre
router.post('/', [auth, validate(validateGenre)], async (req, res) => {
  const genre = new Genre({ name: req.body.name });
  const document = await genre.save();

  res.send(document);
});

// Updating a genre
router.put('/:id', [auth, validateObjectId, validate(validateGenre)], async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

// Deleting a genre
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;
