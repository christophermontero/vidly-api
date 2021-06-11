const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1024
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));

  return token;
};

// User model
const User = mongoose.model('User', userSchema);

// Validation user schema
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().min(1).max(50).required(),
    isAdmin: Joi.bool(),
    password: passwordComplexity().required()
  });

  return schema.validate(user);
}

module.exports = { User, userSchema, validateUser };
