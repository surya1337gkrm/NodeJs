exports.getNotFound = (req, res, next) => {
  //res.status(404).sendFile(path.join(__dirname, 'views', 'pageNotFound.html'));
  res
    .status(404)
    .render('pageNotFound', {
      pageTitle: 'Page Not Found',
      path: req.url,
      isAuthenticated: req.session.loggedIn,
    });
};


exports.get500=(req,res,next)=>{
  res.status(500).render('error500',{
    pageTitle:'Error',
    path:req.url,
  })
}