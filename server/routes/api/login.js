const User = require('../../models/User');
const LoginSession = require('../../models/LoginSession');

module.exports = (app) => {

  //   app.get('/api/counters', (req, res, next) => {
  //     Counter.find()
  //       .exec()
  //       .then((counter) => res.json(counter))
  //       .catch((err) => next(err));
  //   });

  //   app.post('/api/counters', function (req, res, next) {
  //     const counter = new Counter();

  //     counter.save()
  //       .then(() => res.json(counter))
  //       .catch((err) => next(err));
  //   });

  app.post('/api/account/register', (req, res, next) => {
    const {
      body
    } = req;
    const {
      firstName,
      lastName,
      password
    } = body;

    let {
      email
    } = body;

    if (!firstName) {
      return res.send({
        success: false,
        message: 'Error: First Name Cannot be blank'
      });
    }

    if (!lastName) {
      return res.send({
        success: false,
        message: 'Error: Last Name Cannot be blank'
      });
    }

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email Cannot be blank'
      });
    }

    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password Cannot be blank'
      });
    }

    email = email.toLowerCase();

    // Sign Up Steps:
    // 1. Verify if email does not exist
    // 2. Save

    User.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Error: Account already exists'
        });
      }

      const newUser = new User();

      newUser.email = email;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.password = newUser.generateHash(password);
      newUser.save((err, user) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Registered'
        });
      });
    });
  });

  app.post('/api/account/login', (req, res, next) => {
    const {
      body
    } = req;
    const {
      password
    } = body;

    let {
      email
    } = body;

    console.log('body', body);

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email Cannot be blank'
      });
    }

    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password Cannot be blank'
      });
    }

    email = email.toLowerCase();

    User.find({
      email: email
    }, (err, users) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: User not found'
        });
      }

      const user = users[0];

      if (!user.validPassword(password)) {
        return res.send({
          success: false,
          message: 'Error: Invalid password'
        });
      }

      const newLoginSession = new LoginSession();
      newLoginSession.userId = user._id;
      newLoginSession.save((err, doc) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Valid login',
          token: doc._id,
          userId: user._id,
        });
      });
    });
  });

  app.get('/api/account/verify', (req, res, next) => {
    // Verify the token
    const {
      query
    } = req;
    const {
      token
    } = query;
    LoginSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server Error'
        });
      }

      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Token does not exist'
        });
      } else {
        return res.send({
          success: true,
          message: 'Token exists'
        });
      }
    });
  });

  app.get('/api/account/logout', (req, res, next) => {
    // Verify the token
    const {
      query
    } = req;
    const {
      token
    } = query;

    LoginSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
    }, {
      $set: {
        isDeleted: true
      }
    }, {
      useFindAndModify: false
    }, (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server Error'
        });
      }

      return res.send({
        success: true,
        message: 'Logged out'
      });
    });
  });

}
