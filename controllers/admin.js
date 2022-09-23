const { response } = require('express');
const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add-Product',
    path: '/admin/add-product',
    productCSS: true,
    formsCSS: true,
    activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imgUrl, description, price } = req.body;
  console.log(req.body);
  const product = new Product(null, title, imgUrl, description, +price);
  console.log(product);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};

exports.getEditProduct = (req, res, next) => {
  let edited = req.query.edit;

  if (!edited) {
    return res.redirect('/');
  }
  const prodID = req.params.productID;
  Product.findByID(prodID, (product) => {
    if (!product) {
      res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: req.url,
      edited: true,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productID, title, imgUrl, description, price } = req.body;
  const updatedProduct = new Product(
    productID,
    title,
    imgUrl,
    description,
    price
  );
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  const { productID } = req.body;
  Product.deleteProductByID(productID);
  res.redirect('/admin/products');
};
