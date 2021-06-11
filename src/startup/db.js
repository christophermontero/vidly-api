const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = function (app) {
  const db = config.get('db');
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .then(() => {
      if (app.get('env') !== 'test') {
        winston.info({ message: `Connected to ${db} by MongoDB` });
      }
    });
};
