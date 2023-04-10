const Product = require('../models/product');
//const User = require('../models/user');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  //find method in mongoose will return array instead of cursor like with mongodb package
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numOfProducts) => {
      totalItems = numOfProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) =>
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        isAuthenticated: req.session.loggedIn,
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      })
    );
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numOfProducts) => {
      totalItems = numOfProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) =>
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
        isAuthenticated: req.session.loggedIn,
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
        isAuthenticated: req.session.loggedIn,
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
        user: { email: req.user.email, userId: req.user._id },
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
      isAuthenticated: req.session.loggedIn,
    });
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No Order Found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('UnAuthorized.'));
      }
      const filename = 'invoice-' + orderId + '.pdf';
      const filepath = path.join('data', 'invoices', filename);

      //generate pdf using pdfKit
      const pdfDoc = new pdfDocument();
      res.setHeader(
        'Content-Disposition',
        'inline;filename="' + filename + '"'
      );
      //this pdfDoc is a readable stream
      //pipe this to the file systems writable stream
      //this creates a file in the file system
      pdfDoc.pipe(fs.createWriteStream(filepath));
      //to send the pdf file as response to the user pipe the pdfDoc stream to the response
      pdfDoc.pipe(res);

      //add text to the pdf doc using .text method
      //this method adds new line to the pdf doc
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
        lineGap: 2,
      });
      pdfDoc.text('---------------------------');
      let totalPrice = 0;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            product.product.title +
              '-' +
              product.quantity +
              'x' +
              product.product.price
          );
      });
      pdfDoc.fontSize(16).text('Total Price: $' + totalPrice);
      //when writing is done, call .end() method.
      pdfDoc.end();
      // fs.readFile(filepath, (err, data) => {
      //   if (err) {
      //     return next(new Error('File Not Found.'));
      //   }
      //   //if we send the data as it is, it will not be downloaded as a pdf file.
      //   //we need to add required headers to communicate this file as a PDF file
      //   res.setHeader('Content-Type', 'application/pdf');
      //   //inline will display the file in the browser
      //   //attachment will open a popup to download the file
      //   res.setHeader(
      //     'Content-Disposition',
      //     'attachment;filename="' + filename + '"'
      //   );
      //   res.send(data);
      // });

      //Preloading files will cause memory errors when the file size is huge
      //to avoid that we need to stream the file instead of preloading like we did before
      // const file = fs.createReadStream(filepath);

      // //pipe the file data to the response as response is a readable stream
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
