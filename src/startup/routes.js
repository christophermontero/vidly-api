const auth = require('../routes/auth');
const users = require('../routes/users');
const rentals = require('../routes/rentals');
const movies = require('../routes/movies');
const genres = require('../routes/genres');
const customers = require('../routes/customers');
const returns = require('../routes/returns');
const error = require('../middleware/error');
const express = require('express');
const debug = require('debug')('app:startup');
const morgan = require('morgan');

module.exports = function (app) {
  app.use(express.json());

  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
    debug('Morgan enabled');
  }

  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rentals);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/returns', returns);
  app.use(error);
};
