const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../../src/models/genre-model');
const { User } = require('../../../src/models/user-model');

let server;

describe('auth middleware', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Genre.deleteMany({});
  });

  let token;

  beforeEach(async () => {
    token = new User().generateAuthToken();
  });

  const exec = () => {
    return request(server).post('/api/genres').set('x-auth-token', token).send({ name: 'genre1' });
  };

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
