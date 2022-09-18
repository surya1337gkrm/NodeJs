const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = require('../util/path');
const adminData = require('./admin');

router.get('/', (req, res, next) => {
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  const products = adminData.products;
  //instead of sending html, we need to use template we defined, use res.render() method
  //and also pass the data to the template to use them in the template

  //use path variable to dynamically add active class to the hrefs
  res.render('shop', { prods: products, pageTitle: 'Shop',path:'/' });
});

module.exports = router;
