const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = require('../util/path');
const products = [];

router.get('/add-product', (req, res) => {
  //res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('add-product', { pageTitle: 'Add-Product',path:'/add-product' });
});

router.post('/product', (req, res) => {
  console.log(req.body.title);
  products.push(req.body.title);
  res.redirect('/');
});

//module.exports = router;
exports.router = router;
exports.products = products;
