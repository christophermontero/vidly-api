const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const { User, validateUser } = require('../models/user-model');
const auth = require('../middleware/auth-middleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.send(user);
});

// Creating a user
router.post('/', [auth, validate(validateUser)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user.save().then((document) => res.send(_.pick(document, ['_id', 'name', 'email'])));
});

module.exports = router;
