const express = require('express');
const path = require('path');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post(
  '/add-product',
  isAuth,
  [
    body('title', 'Title should be a string with minimum 3 characters')
      .trim()
      .isString()
      .isLength({ min: 3 }),
    body('imgUrl').isURL().withMessage('Enter a valid URL.'),
    body('price', 'Enter a valid Float value.').isFloat(),
    body('description', 'Enter a valid string with minimum 5 charecters.')
      .trim()
      .isString()
      .isLength({ min: 5 }),
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productID', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  [
    body('title', 'Title should be a string with minimum 3 characters')
      .trim()
      .isString()
      .isLength({ min: 3 }),
    body('imgUrl').isURL().withMessage('Enter a valid URL.'),
    body('price', 'Enter a valid Float value.').isFloat(),
    body('description', 'Enter a valid string with minimum 5 charecters.')
      .trim()
      .isString()
      .isLength({ min: 5 }),
  ],
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

//module.exports = router;
module.exports = router;
