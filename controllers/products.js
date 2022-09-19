const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('add-product', {
    pageTitle: 'Add-Product',
    path: '/add-product',
    productCSS: true,
    formsCSS: true,
    activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res) => {
  const product = new Product(req.body.title);
  console.log(product);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  //passing a callback to the fetchAll method.
  //where this callback will be called with the products.
  Product.fetchAll((products) => {
    res.render('shop', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
    });
  });
};
