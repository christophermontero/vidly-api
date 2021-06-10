const winston = require('winston');
require('winston-mongodb');

const loggerEx = winston.createLogger({
  format: winston.format.simple()
});

module.exports = loggerEx;
