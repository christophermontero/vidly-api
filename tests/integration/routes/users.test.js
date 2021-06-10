const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../../src/models/user-model');
let server;

describe('/api/users', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /me', () => {
    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).get('/api/users/me');

      expect(res.status).toBe(401);
    });

    it('should return the user if it is valid', async () => {
      const user = new User({
        name: 'name test',
        email: 'testing@email.com',
        password: 'Ab12345678+'
      });
      const token = user.generateAuthToken();
      await user.save();

      const res = await request(server).get('/api/users/me').set('x-auth-token', token);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'name test');
      expect(res.body).toHaveProperty('email', 'testing@email.com');
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let email;
    let password;

    const exec = () => {
      return request(server).post('/api/users').set('x-auth-token', token).send({
        name,
        email,
        password
      });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'name1';
      email = 'test@email.com';
      password = 'Ab12345678+';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if name is less than 2 characters', async () => {
      name = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      email = 'email';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is alredy exists', async () => {
      const user = new User({ name, email, password });
      await user.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if pattern password is invalid', async () => {
      password = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the user if it is valid', async () => {
      await exec();

      const user = await User.find({ name: 'name1' });

      expect(user).not.toBeNull();
    });

    it('should return the user if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'name1');
      expect(res.body).toHaveProperty('email', 'test@email.com');
      expect(res.body).not.toHaveProperty('password');
    });
  });
});
