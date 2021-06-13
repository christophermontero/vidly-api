const express = require('express');
const winston = require('winston');

const app = express();

require('./src/startup/logging')(app);
require('./src/startup/routes')(app);
require('./src/startup/db')(app);
require('./src/startup/config')();
require('./src/startup/validation')();
require('./src/startup/prod')(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  if (app.get('env') !== 'test') {
    winston.info(`Listening on port: ${port}`);
  }
});

module.exports = server;
