const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// //add a route with dynamic param : here productID is the variable we use to capture the dynamic parameter
router.get('/products/:productID', shopController.getProduct);

router.get('/cart',isAuth, shopController.getCart);

router.post('/cart',isAuth, shopController.postCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteItem);

router.get('/orders',isAuth, shopController.getOrders);

router.post('/create-order',isAuth, shopController.postOrder);

module.exports = router;
