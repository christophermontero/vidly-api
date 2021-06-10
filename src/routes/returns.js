const express = require('express');
const { Rental, validateRental } = require('../models/rental-model');
const auth = require('../middleware/auth-middleware');
const moment = require('moment');
// const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Creating a movie return
router.post('/', auth, async (req, res) => {
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(error);

  let rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });

  if (!rental) return res.status(404).send('Rental not found');
  if (rental.dateReturned) return res.status(400).send('Return is alredy processed');

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  res.send(rental);
});

module.exports = router;
