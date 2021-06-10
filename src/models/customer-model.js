const mongoose = require('mongoose');
const Joi = require('joi');

// Customer model
const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50
    },
    isGold: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 10
    }
  })
);

// Validation customer schema
function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    isGold: Joi.bool(),
    phone: Joi.string().min(7).max(10)
  });

  return schema.validate(customer);
}

module.exports = { Customer, validateCustomer };
