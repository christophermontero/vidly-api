const express = require('express');
const { Rental, validateRental } = require('../models/rental-model');
const { Movie } = require('../models/movie-model');
const auth = require('../middleware/auth-middleware');
const validate = require('../middleware/validate');
const moment = require('moment');

const router = express.Router();

// Creating a movie return
router.post('/', [auth, validate(validateRental)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found');
  if (rental.dateReturned) return res.status(400).send('Return is alredy processed');

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 }
    }
  );

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  res.send(rental);
});

module.exports = router;
