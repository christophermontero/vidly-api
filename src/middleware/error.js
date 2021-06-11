const winston = require('winston');

module.exports = function (err, req, res, next) {
  winston.error({ message: err.message, metadata: err.stack });

  res.status(500).send('FATAL ERROR: Something failed');
};
