const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function (logger, app) {
  logger.exceptions.handle(new winston.transports.File({ filename: 'uncaughtExceptions.log' }));

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  winston.add(
    new winston.transports.File({
      filename: 'logfile.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint())
    })
  );
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      handleExceptions: true
    })
  );
  if (app.get('env') !== 'test') {
    winston.add(
      new winston.transports.MongoDB({
        db: 'mongodb://localhost/vidlyDb',
        level: 'error',
        options: { useUnifiedTopology: true }
      })
    );
  }
};
