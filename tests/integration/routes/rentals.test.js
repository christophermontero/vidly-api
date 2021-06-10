const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../../src/models/rental-model');
const { User } = require('../../../src/models/user-model');
const { Customer } = require('../../../src/models/customer-model');
const { Movie } = require('../../../src/models/movie-model');
const { Genre } = require('../../../src/models/genre-model');
let server;

describe('/api/rentals', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Customer.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all rentals', async () => {
      await Rental.collection.insertMany([
        {
          customer: {
            name: 'name1',
            phone: '12345678'
          },
          movie: {
            title: 'movie1',
            dailyRentalRate: 1
          }
        },
        {
          customer: {
            name: 'name2',
            phone: '12345678'
          },
          movie: {
            title: 'movie2',
            dailyRentalRate: 1
          }
        }
      ]);

      const res = await request(server).get('/api/rentals');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((rental) => rental.customer.name === 'name1')).toBeTruthy();
      expect(res.body.some((rental) => rental.customer.name === 'name2')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let token;
    let customer;
    let movie;
    let genre;
    let customerId;
    let movieId;

    const exec = () => {
      return request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'name1', isGold: true, phone: '12345678' });
      await customer.save();
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      movie = new Movie({
        title: 'movie1',
        numberInStock: 1,
        genre: { _id: genre._id, name: genre.name },
        dailyRentalRate: 1
      });
      await movie.save();
      token = new User().generateAuthToken();
      customerId = customer._id;
      movieId = movie._id;
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

    it('should return 400 if movie id is invalid', async () => {
      movieId = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer with the given id was not found', async () => {
      customerId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie with the given id was not found', async () => {
      movieId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if there is not movie in stock', async () => {
      const emptyStock = new Movie({
        title: 'movie2',
        numberInStock: 0,
        genre: { _id: genre._id, name: genre.name },
        dailyRentalRate: 1
      });
      await emptyStock.save();

      movieId = emptyStock._id;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the rental if it is valid', async () => {
      await exec();

      const rental = await Rental.find();

      expect(rental.some((rental) => rental.customer.name === 'name1')).toBeTruthy();
      expect(rental.some((rental) => rental.movie.title === 'movie1')).toBeTruthy();
    });

    it('should return the rental if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('customer');
      expect(res.body).toHaveProperty('movie');
    });
  });
});
