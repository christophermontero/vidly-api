const auth = require('../src/routes/auth');
const users = require('../src/routes/users');
const rentals = require('../src/routes/rentals');
const movies = require('../src/routes/movies');
const genres = require('../src/routes/genres');
const customers = require('../src/routes/customers');
const returns = require('../src/routes/returns');
const error = require('../src/middleware/error');
const helmet = require('helmet');
const express = require('express');
const debug = require('debug')('app:startup');
const morgan = require('morgan');

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());

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
