const winston = require('winston');
require('winston-mongodb');
const expressWinston = require('express-winston');
const config = require('config');
require('express-async-errors');

module.exports = function (app) {
  if (app.get('env') !== 'test') {
    winston.exceptions.handle(
      new winston.transports.MongoDB({
        db: config.get('db'),
        options: { useUnifiedTopology: true }
      })
    );

    process.on('unhandledRejection', (ex) => {
      throw ex;
    });

    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        handleExceptions: true
      })
    );

    winston.add(
      new winston.transports.MongoDB({
        db: config.get('db'),
        options: { useUnifiedTopology: true }
      })
    );

    app.use(
      expressWinston.logger({
        transports: [
          new winston.transports.Console(),
          new winston.transports.MongoDB({
            db: config.get('db'),
            level: 'http',
            metaKey: 'meta',
            options: { useUnifiedTopology: true }
          })
        ],
        format: winston.format.json(),
        msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        requestWhitelist: ['url', 'headers', 'method', 'httpVersion', 'query', 'params', 'body'],
        responseWhitelist: ['statusCode', 'statusMessage'],
        expressFormat: false,
        colorize: false,
        statusLevels: false,
        level: function name(req, res) {
          let level = '';
          if (res.statusCode >= 100) level = 'http';
          if (res.statusCode >= 400) level = 'warn';
          if (res.statusCode >= 500) level = 'error';
          if (res.statusCode == 401 || res.statusCode == 403) level = 'error';

          return level;
        }
      })
    );
  }
};
