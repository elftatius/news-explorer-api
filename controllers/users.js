const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const DuplicationError = require('../errors/duplication-err');

const { passwordRegex } = require('../utils/regex');
const User = require('../models/user');

module.exports.getMe = (req, res, next) => {
  const { _id } = req.user;
  User
    .findById(_id)
    .then(
      (user) => {
        res.send({
          data: {
            name: user.name,
            email: user.email,
          },
        });
      },
    )
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  if (!passwordRegex.test(password)) {
    throw new ValidationError();
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const userToReturn = user.toJSON();
      delete userToReturn.password;
      res.send({ data: userToReturn });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError();
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new DuplicationError('Такой e-mail уже занят.');
      }
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
