
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config('../.env');

const User = require('../models/User');

const signup = (req, res, next) => {
  const { email, username, password } = req.body; // user attributes from request body

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      // new user details
      const user = new User({
        email,
        username,
        password: hash
      });
      // attempt to save user in database
      user
        .save()
        // response returned after successfully saving user in database
        .then(() => res.status(201).json({ code: 201, message: 'user successfully created' }))
        .catch((err) => {
          // in case of any error when saving user in database
          // we channel the error to the error handler in app.js
          next(err);
        });
    })
    .catch((error) => {
      // if an error is encountered hashing the password
      // we channel the error to the error handler in app.js
      next(error);
    });
};


const login = (req, res, next) => {
  User
    .findOne({ email: req.body.email })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      // if user is not found
      if (!user) {
        return res
          .status(401)
          .json({
            coed: 401,
            message: 'user not found'
          });
      }

      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // if compare returns false
          // it implies provided password is incorrect
          if (!valid) {
            return res
              .status(401)
              .json({
                code: 401,
                message: 'incorrect password'
              });
          }

          // else if compare returns true
          // create a jwt token and send response
          // eslint-disable-next-line no-underscore-dangle
          const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '24h' });
          return res
            .status(200)
            .json({
              code: 200,
              message: 'login successful',
              token
            });
        })
        .catch((err) => {
          next(err); // channel errors to logger in app.js
        });
    })
    .catch((error) => {
      next(error); // channel error to logger in  app.js
    });
};

module.exports = {
  signup,
  login
};
