const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

//to use sendgird
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         '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',
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
  });
};

exports.postLogin = (req, res, next) => {
  //setting a http only cookie. if HttpOnly specified, we cant access this cookie from client side.
  //   res.setHeader('Set-Cookie', 'loggedIn=true;HttpOnly');
  //using sessions

  const { email, password } = req.body;

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
  });
};
exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  //input validation: pending
  User.findOne({ email: email })
    .then((_user) => {
      if (_user) {
        req.flash('error', 'Email exists already. Pick a new one.');
        return res.redirect('/signup');
      }
      //hash the password. hash method takes password and a number which...
      //...is number of times hashing will be done. more the number, more secure and takes more time to hash
      //hashing is asynchronous so returns a promise
      return bcrypt
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
    })
    .catch((err) => console.log(err));
};
