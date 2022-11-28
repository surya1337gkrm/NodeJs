const Product = require('../models/product');
//const User = require('../models/user');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  //find method in mongoose will return array instead of cursor like with mongodb package
  Product.find().then((products) =>
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      isAuthenticated: req.session.loggedIn
    })
  );
};

exports.getIndex = (req, res, next) => {
  Product.find().then((products) =>
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      isAuthenticated: req.session.loggedIn
    })
  );
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productID;

  //we can use primary key to filter the product
  //mongoose has a findById method
  //and mongoose findById method can take a string too instead of mongoDB ID.
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: req.url,
        prod: product,
        isAuthenticated: req.session.loggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      //as we are populating the field, data will be updated instead of just ID...
      //...and that will be returned
      //console.log(user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.loggedIn
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
 req.user
    .populate('cart.items.productId')
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((el) => {
        //default mongoose productId object will have lot's of metadata
        //to avoid storing all those data to db, create a new object and spread only the document data using ._doc field
        return { quantity: el.quantity, product: { ...el.productId._doc } };
      });
      const order = new Order({
        user: { name:req.user.name, userId:req.user._id },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => res.redirect('/orders'))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  //while fetching the orders, also include and ftech the products related to those orders
  Order.find({ 'user.userId': req.user._id }).then((orders) => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: req.url,
      orders: orders,
      isAuthenticated: req.session.loggedIn
    });
  });
};
