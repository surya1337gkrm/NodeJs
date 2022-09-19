const express = require('express');
const path = require('path');
const router = express.Router();

const products = require('../controllers/products');

router.get('/add-product', products.getAddProduct);

router.post('/product', products.postAddProduct);

//module.exports = router;
module.exports = router;
