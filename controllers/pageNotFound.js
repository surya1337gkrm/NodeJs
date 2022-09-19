exports.getNotFound = (req, res, next) => {
  console.log(req.url);
  //res.status(404).sendFile(path.join(__dirname, 'views', 'pageNotFound.html'));
  res
    .status(404)
    .render('pageNotFound', { pageTitle: 'Page Not Found', path: req.url });
};
