const request = require('supertest');
const mongoose = require('mongoose');
const { Customer } = require('../../../src/models/customer-model');
const { User } = require('../../../src/models/user-model');
let server;

describe('/api/customers', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Customer.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      await Customer.collection.insertMany([
        {
          name: 'name1',
          phone: '12345678',
          isGold: true
        },
        {
          name: 'name2',
          phone: '12345678',
          isGold: false
        }
      ]);

      const res = await request(server).get('/api/customers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((customer) => customer.name === 'name1')).toBeTruthy();
      expect(res.body.some((customer) => customer.name === 'name2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 if customer does not exists', async () => {
      const res = await request(server).get(`/api/customers/${mongoose.Types.ObjectId()}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/customers/1');

      expect(res.status).toBe(404);
    });

    it('should return a customer if valid id is passed', async () => {
      const customer = new Customer({
        name: 'name1',
        phone: '12345678',
        isGold: true
      });

      await customer.save();
      const res = await request(server).get(`/api/customers/${customer._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', customer.name);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let isGold;
    let phone;

    const exec = () => {
      return request(server).post('/api/customers').set('x-auth-token', token).send({
        name,
        isGold,
        phone
      });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'name1';
      isGold = true;
      phone = '12345678';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 2 characters', async () => {
      name = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is greater than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if gold is not a boolean', async () => {
      isGold = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is less than 8 characters', async () => {
      phone = '123456';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is greater than 10 characters', async () => {
      phone = '12345678910';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await exec();

      const customer = await Customer.find({ name: 'name1' });

      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'name1');
      expect(res.body).toHaveProperty('isGold');
      expect(res.body).toHaveProperty('phone', '12345678');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let customer;
    let id;
    let newIsGold;
    let newPhone;

    const exec = () => {
      return request(server).put(`/api/customers/${id}`).set('x-auth-token', token).send({
        isGold: newIsGold,
        phone: newPhone
      });
    };

    beforeEach(async () => {
      customer = new Customer({
        name: 'name1',
        isGold: false,
        phone: 12345678
      });
      await customer.save();
      token = new User().generateAuthToken();
      id = customer._id;
      newIsGold = true;
      newPhone = '12345679';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if is gold is not a boolean', async () => {
      newIsGold = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 7 characters', async () => {
      newPhone = '123456';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is greater than 10 characters', async () => {
      newPhone = '12345678910';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if customer with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the customer if input is valid', async () => {
      await exec();

      const updateCustomer = await Customer.findById(id);

      expect(updateCustomer.isGold).toBe(newIsGold);
      expect(updateCustomer.phone).toBe(newPhone);
    });

    it('should update is gold if input is valid', async () => {
      newPhone = customer.phone;

      await exec();

      const updateCustomer = await Customer.findById(id);

      expect(updateCustomer.isGold).toBe(newIsGold);
      expect(updateCustomer.phone).toBe(newPhone);
    });

    it('should update the phone if input is valid', async () => {
      newIsGold = customer.isGold;

      await exec();

      const updateCustomer = await Customer.findById(id);

      expect(updateCustomer.isGold).toBe(newIsGold);
      expect(updateCustomer.phone).toBe(newPhone);
    });

    it('should return the updated customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('isGold', newIsGold);
      expect(res.body).toHaveProperty('phone', newPhone);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let customer;
    let id;

    const exec = () => {
      return request(server).delete(`/api/customers/${id}`).set('x-auth-token', token).send();
    };

    beforeEach(async () => {
      customer = new Customer({
        name: 'name1',
        isGold: false,
        phone: 12345678
      });
      await customer.save();
      id = customer._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if customer with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the customer if input is valid', async () => {
      await exec();

      const customerInDb = await Customer.findById(id);

      expect(customerInDb).toBeNull();
    });

    it('should return the remove customer', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', customer._id.toHexString());
      expect(res.body).toHaveProperty('name', customer.name);
      expect(res.body).toHaveProperty('isGold', customer.isGold);
      expect(res.body).toHaveProperty('phone', customer.phone);
    });
  });
});
