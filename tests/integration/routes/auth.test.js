const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../../../src/models/user-model');
let server;

describe('/api/auth', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  describe('POST /', () => {
    let token;
    let user;
    let email;
    let password;
    let hash;

    const exec = () => {
      return request(server).post('/api/auth').send({
        email,
        password
      });
    };

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash('Ab12345678+', salt);
      user = new User({ name: 'name1', email: 'test@email.com', password: hash });
      token = user.generateAuthToken();
      await user.save();
    });

    beforeEach(() => {
      email = 'test@email.com';
      password = 'Ab12345678+';
    });

    afterAll(async () => {
      await User.deleteMany({});
    });

    it('should return 400 if email is invalid', async () => {
      email = 'email';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if pattern of password is invalid', async () => {
      password = 'password';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if user does not exists', async () => {
      email = 'testing@email.com';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is invalid', async () => {
      password = 'Cb12345678+';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return a valid token', async () => {
      const res = await exec();

      expect(res.headers['x-auth-token']).toBeTruthy();
      // expect(res.headers['x-auth-token']).toBe(token);
    });
  });
});
