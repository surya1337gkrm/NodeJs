const User = require('../models/user');
exports.getLogin = (req, res, next) => {
  //   let loggedIn;
  //   if (req.get('Cookie')) {
  //     loggedIn = req.get('Cookie').split(';')[0].trim().split('=')[1] === 'true';
  //   }
  //   console.log(loggedIn);
  console.log(req.session.loggedIn);

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
    //setting a http only cookie. if HttpOnly specified, we cant access this cookie from client side.
  //   res.setHeader('Set-Cookie', 'loggedIn=true;HttpOnly');
  //using sessions

  User.findById('637ea7aaf503adccbe2228cd')
    .then((user) => {
      //mongoose returns a mongoose object instead of a js obj which has all methods
      req.session.loggedIn = true;
      req.session.user = user;
      //sometimes saving/writing session data to thr db will take sometime and...
      //...meanwhile redirect might be executed. to avoid that, we can call save method on the..
      //...session and using a callback do the redirect.
      req.session.save(() => res.redirect('/'));
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
