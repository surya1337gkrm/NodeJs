const Product = require('../models/product');
const User = require('../models/user');
// const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then((products) =>
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
    })
  );
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then((products) =>
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    })
  );
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productID;

  //we can use primary key to filter the product
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: req.url,
        prod: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })

    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.id;
  Product.findById(prodId)
    .then((product) => req.user.addToCart(product))
    .then((result) => res.redirect('/cart'))
    .catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodID = req.body.productID;
  req.user
    .deleteItemFromCart(prodID)
    .then((result) => res.redirect('/cart'))
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then((result) => res.redirect('/orders'))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  //while fetching the orders, also include and ftech the products related to those orders
  req.user.getOrders().then((orders) => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: req.url,
      orders: orders,
    });
  });
};
