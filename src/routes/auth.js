const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const bcrypt = require('bcrypt');
const express = require('express');
const { User } = require('../models/user-model');

const router = express.Router();

// Authenticating a user
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password!.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();

  res.header('x-auth-token', token).send('Login successfully.');
});

// Validation user schema
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().min(1).max(255).required(),
    password: passwordComplexity()
  });

  return schema.validate(req);
}

module.exports = router;
