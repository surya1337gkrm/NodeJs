const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
//result returned by the middleware in the route will be catched by this package method here.
const { validationResult } = require('express-validator');
//to use sendgird
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         'Your SendGRID API KEY',
//     },
//   })
// );

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vijjanas1@udayton.edu',
    pass: 'SuryaMaddy1337',
  },
});

exports.getLogin = (req, res, next) => {
  //   let loggedIn;
  //   if (req.get('Cookie')) {
  //     loggedIn = req.get('Cookie').split(';')[0].trim().split('=')[1] === 'true';
  //   }
  //   console.log(loggedIn);

  //console.log('j', req.flash('error'));
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    prevInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  //setting a http only cookie. if HttpOnly specified, we cant access this cookie from client side.
  //   res.setHeader('Set-Cookie', 'loggedIn=true;HttpOnly');
  //using sessions

  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      prevInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      //mongoose returns a mongoose object instead of a js obj which has all methods
      if (!user) {
        //add error message to the session
        req.flash('error', 'Invalid Credentials.');
        return res.redirect('/login');
      }
      //if user exists, compare the password
      //bcrypt returns a promise with boolean value
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.loggedIn = true;
            req.session.user = user;
            //sometimes saving/writing session data to the db will take sometime and...
            //...meanwhile redirect might be executed. to avoid that, we can call save method on the..
            //...session and using a callback do the redirect.
            return req.session.save(() => res.redirect('/'));
          }
          //if didnt match
          req.flash('error', 'Invalid Credentials.');
          return res.redirect('/login');
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  //destroying the session on logout
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    prevInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: [],
  });
};
exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      prevInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  //if there are no errors, we will go to hashing thr password fn.

  //hash the password. hash method takes password and a number which...
  //...is number of times hashing will be done. more the number, more secure and takes more time to hash
  //hashing is asynchronous so returns a promise
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
      //   return transporter
      //     .sendMail({
      //       to: email,
      //       from: 'vijjanas1@udayton.edu',
      //       subject: 'Signup success',
      //       html: '<h1>Success</h1>',
      //     })
      //     .catch((err) => console.log(err));

      //using gmail to send the mails using nodemailer
      return transporter
        .sendMail({
          to: email,
          from: 'vijjanas1@udayton.edu',
          subject: 'Signup succeeded',
          html: '<h1>You successfully signed up!</h1>',
        })
        .catch((error) => {
          console.log('error = ', error, '\n');
        });
    });
};
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  //use crypto lib to generate random bytes
  crypto.randomBytes(32, (err, buffer) => {
    if (err) return res.redirect('/reset');
    //if there is no error, we have the token
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'User not found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        //add 1hour as expiration time
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter
          .sendMail({
            to: req.body.email,
            from: 'vijjanas1@udayton.edu',
            subject: 'Password Reset',
            html: `
              <p>You requested for a password reset.</p>
              <p>Click <a href='http://localhost:3000/reset/${token}'>here</a> to reset the reset the password.</p>
              `,
          })
          .catch((error) => {
            console.log('error = ', error, '\n');
          });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    //checking if the resetToken Expiration is greater than current time
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        console.log('User Not Found.');
        return res.redirect('/reset');
      }
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => res.redirect('/login'))
    .catch((err) => console.log(err));
};
