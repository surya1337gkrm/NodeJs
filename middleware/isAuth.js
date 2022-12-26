//protect routes

module.exports = (req, res, next) => {
  //each end point handler in routes can take multiple middlewares as arguments and they will be called in sequential order.
  if (!req.session.loggedIn) {
    res.redirect('/login');
  }
  next();
};
