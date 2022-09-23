const Product = require('../models/product');
const Cart = require('../models/cart');
exports.getProducts = (req, res, next) => {
  //passing a callback to the fetchAll method.
  //where this callback will be called with the products.
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/product-list',
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productID;
  Product.findByID(prodId, (product) => {
    res.render('shop/product-detail', {
      pageTitle: product.title,
      path: req.url,
      prod: product,
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.id;
  Product.findByID(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('/shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.postCardDeleteItem = (req, res, next) => {
  const prodID = req.body.productID;
  Product.findByID(prodID, (product) => {
    Cart.deleteProduct(product.id,product.price);
    res.redirect('/cart');
  });
};
