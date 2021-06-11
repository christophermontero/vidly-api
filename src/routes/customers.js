const express = require('express');
const _ = require('lodash');
const { Customer, validateCustomer } = require('../models/customer-model');
const auth = require('../middleware/auth-middleware');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Getting all customers
router.get('/', async (req, res) => {
  const customer = await Customer.find().sort('name').exec();

  res.send(customer);
});

// Getting especific customer
router.get('/:id', validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

// Creating a customer
router.post('/', [auth, validate(validateCustomer)], async (req, res) => {
  const customer = Customer(_.pick(req.body, ['name', 'isGold', 'phone']));

  const document = await customer.save();

  res.send(document);
});

// Updating a customer
router.put('/:id', [auth, validateObjectId, validate(validateCustomer)], async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  customer.isGold = req.body.isGold === undefined ? customer.isGold : req.body.isGold;
  customer.phone = req.body.phone ? req.body.phone : customer.phone;

  customer.save().then((document) => res.send(document));
});

// Deleting a genre
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

module.exports = router;
