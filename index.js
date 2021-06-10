const express = require('express');
const winston = require('winston');
const loggerEx = require('./src/middleware/logger');
const app = express();

require('./startup/logging')(loggerEx, app);
require('./startup/routes')(app);
require('./startup/db')(app);
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  if (app.get('env') !== 'test') {
    winston.info(`Listening on port: ${port}`);
  }
});

module.exports = server;
