const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../../src/models/rental-model');
const { User } = require('../../../src/models/user-model');
let server;

describe('/api/returns', () => {
  let token;
  let rental;
  let customerId;
  let movieId;

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'name1',
        phone: '12345678'
      },
      movie: {
        _id: movieId,
        title: 'title1',
        dailyRentalRate: 2
      }
    });
    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if customer id is invalid', async () => {
    customerId = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if customer id is invalid', async () => {
    movieId = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if return is alredy processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if rental was not found', async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return a rental if it is valid', async () => {
    await exec();

    const rentalInDb = await Rental.findOne({
      'customer._id': customerId,
      'movie._id': movieId
    });

    expect(rentalInDb).toHaveProperty('_id', rental._id);
    expect(rentalInDb).toHaveProperty('customer.name', rental.customer.name);
    expect(rentalInDb).toHaveProperty('customer.phone', rental.customer.phone);
    expect(rentalInDb).toHaveProperty('movie.title', rental.movie.title);
    expect(rentalInDb).toHaveProperty('movie.dailyRentalRate', rental.movie.dailyRentalRate);
  });

  it('should return the date', async () => {
    await exec();

    const rentalInDb = await Rental.findOne({
      'customer._id': customerId,
      'movie._id': movieId
    });

    const diff = new Date() - rentalInDb.dateReturned;

    expect(rentalInDb).toHaveProperty('_id', rental._id);
    expect(rentalInDb).toHaveProperty('customer.name', rental.customer.name);
    expect(rentalInDb).toHaveProperty('customer.phone', rental.customer.phone);
    expect(rentalInDb).toHaveProperty('movie.title', rental.movie.title);
    expect(rentalInDb).toHaveProperty('movie.dailyRentalRate', rental.movie.dailyRentalRate);
    expect(rentalInDb.dateReturned).toBeDefined();
    expect(diff).toBeLessThan(10 * 1000);
  });
});