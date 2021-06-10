const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../../src/models/movie-model');
const { User } = require('../../../src/models/user-model');
const { Genre } = require('../../../src/models/genre-model');
let server;

describe('/api/movies', () => {
  beforeAll(() => {
    server = require('../../../index');
  });

  afterAll(async () => {
    await server.close();
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: 'movie1',
          genre: { name: 'genre1' },
          numberInStock: 1,
          dailyRentalRate: 2
        },
        {
          title: 'movie2',
          genre: { name: 'genre2' },
          numberInStock: 1,
          dailyRentalRate: 2
        }
      ]);
      const res = await request(server).get('/api/movies');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some((movie) => movie.title === 'movie1' && movie.genre.name === 'genre1')
      ).toBeTruthy();
      expect(
        res.body.some((movie) => movie.title === 'movie2' && movie.genre.name === 'genre2')
      ).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a movie if valid id is passed', async () => {
      const movie = new Movie({
        title: 'movie1',
        genre: { name: 'genre1' },
        numberInStock: 1,
        dailyRentalRate: 2
      });
      await movie.save();
      const res = await request(server).get(`/api/movies/${movie._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/movies/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if movie was not found', async () => {
      const res = await request(server).get(`/api/movies/${mongoose.Types.ObjectId()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let title;
    let numberInStock;
    let dailyRentalRate;
    let genre;
    let genreId;

    const exec = () => {
      return request(server).post('/api/movies').set('x-auth-token', token).send({
        title,
        genreId,
        numberInStock,
        dailyRentalRate
      });
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      token = new User().generateAuthToken();
      title = 'movie1';
      numberInStock = 1;
      dailyRentalRate = 1;
      genreId = genre._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 2 characters', async () => {
      title = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is greater than 50 characters', async () => {
      title = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre id is invalid', async () => {
      genreId = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if number in stock is less than 0', async () => {
      numberInStock = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if number in stock is greater than 255', async () => {
      numberInStock = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if daily rental rate is less than 0', async () => {
      dailyRentalRate = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if daily rental rate is greater than 255', async () => {
      dailyRentalRate = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if genre is not found', async () => {
      genreId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should save the movie if it is valid', async () => {
      await exec();

      const movie = await Movie.find({ title: 'movie1' });

      expect(movie).not.toBeNull();
    });

    it('should return the movie if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('genre');
      expect(res.body).toHaveProperty('title', 'movie1');
      expect(res.body).toHaveProperty('numberInStock', 1);
      expect(res.body).toHaveProperty('dailyRentalRate', 1);
    });
  });

  describe('PUT /:id', () => {
    let token;
    let movie;
    let genre;
    let newGenre;
    let movieId;
    let newTitle;
    let newGenreId;
    let newNumberInStock;
    let newDailyRentalRate;

    const exec = () => {
      return request(server).put(`/api/movies/${movieId}`).set('x-auth-token', token).send({
        title: newTitle,
        genreId: newGenreId,
        numberInStock: newNumberInStock,
        dailyRentalRate: newDailyRentalRate
      });
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      newGenre = new Genre({ name: 'new genre' });
      await newGenre.save();
      movie = new Movie({
        title: 'title1',
        genre: { id: genre._id, name: genre.name },
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await movie.save();
      movieId = movie._id;
      newTitle = 'newTitle';
      newGenreId = newGenre._id;
      newNumberInStock = 2;
      newDailyRentalRate = 2;
      token = new User().generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 2 characters', async () => {
      newTitle = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is greater than 50 characters', async () => {
      newTitle = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre id is invalid', async () => {
      newGenreId = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if number in stock is less than 0', async () => {
      newNumberInStock = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if number in stock is greater than 255', async () => {
      newNumberInStock = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if daily rental rate is less than 0', async () => {
      newDailyRentalRate = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if daily rental rate is greater than 255', async () => {
      newDailyRentalRate = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if genre with the given id was not found', async () => {
      newGenreId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if movie id is invalid', async () => {
      movieId = '1';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if movie with the given id was not found', async () => {
      movieId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the movie if input is valid', async () => {
      await exec();

      const updatedMovie = await Movie.findById(movieId);

      expect(updatedMovie).not.toBeNull();
      expect(updatedMovie.title).toBe(movie.title);
      expect(updatedMovie.genre.name).toContain(newGenre.name);
      expect(updatedMovie.numberInStock).toBe(newNumberInStock);
      expect(updatedMovie.dailyRentalRate).toBe(newDailyRentalRate);
    });

    it('should return the updated movie if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('numberInStock', newNumberInStock);
      expect(res.body).toHaveProperty('dailyRentalRate', newDailyRentalRate);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let movie;
    let id;
    let genre;

    const exec = () => {
      return request(server).delete(`/api/movies/${id}`).set('x-auth-token', token).send();
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      movie = new Movie({
        title: 'title1',
        genre: { id: genre._id, name: genre.name },
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await movie.save();
      id = movie._id;
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

    it('should return 404 if movie with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the movie if input is valid', async () => {
      await exec();

      const movieInDb = await Movie.findById(id);

      expect(movieInDb).toBeNull();
    });

    it('should return the removed movie', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', id.toHexString());
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
      expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
    });
  });
});
