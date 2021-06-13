const winston = require('winston');

module.exports = function (req, res, next) {
  winston.http({ message: `Request to ${req.originalUrl}`, metadata: req });

  next();
};
