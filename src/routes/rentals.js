const express = require('express');
const { Rental, validateRental } = require('../models/rental-model');
const { Movie } = require('../models/movie-model');
const { Customer } = require('../models/customer-model');
const auth = require('../middleware/auth-middleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Getting all rentals
router.get('/', async (req, res) => {
  const rental = await Rental.find().sort('-dateOut').exec();

  res.send(rental);
});

// Creating a rental
router.post('/', [auth, validate(validateRental)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('The customer with the given ID was not found.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('The movie with the given ID was not found.');
  if (movie.numberInStock === 0) return res.status(400).send('Movie does not in stock.');

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      isGold: customer.isGold,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  rental.save().then((document) => res.send(document));

  movie.numberInStock--;
  await movie.save();
});

module.exports = router;
