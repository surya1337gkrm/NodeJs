const Product = require('../models/product');
const mongodb = require('mongodb');
const { validationResult } = require('express-validator');
//findByID() in sequelize is replaced with findByPk()

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add-Product',
    path: '/admin/add-product',
    product: {
      title: '',
      imgUrl: '',
      price: '',
      description: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imgUrl, description, price } = req.body;
  const product = new Product({
    title,
    imgUrl,
    description,
    price,
    //we can either pass req.user._id [id specifically] or mongoose will directly take id from the user object we passed.
    userId: req.user,
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add-Product',
      path: '/admin/add-product',
      errorMessage: errors.array()[0].msg,
      product: { title, imgUrl, description, price },
      validationErrors: errors.array(),
    });
  }
  //mongoose model Product do have a save method defined
  //which saves the data to the mongoDB and returns a promise
  product
    .save()
    .then((result) => {
      console.log('Product added.');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      //we can either call an erorr page by redirecting the page to error route as follows
      //res.redirect('/500')
      //(or)
      //we can wrap the err using Error class and use the middleware.
      const error = new Error(err);
      error.httpStatusCode = 500;
      //when we use next() middleware fn and pass the error object as parameter,...
      //...express will catch this error immediately and executes the middleware function associated to it.
      return next(error);
    });
  //add userid which we can access for req.user
  /*we can either pass user in the create method or we can use association metjhods like createProduct()
  createProduct should be called on user sequelize object : user hasMany Products and method
  is create so sequelize created a method named createProduct */

  //method01
  // Product.create({ title, imgUrl, description, price, userId: req.user.id })
  //   .then((result) => {
  //     console.log('Product Created.');
  //     res.redirect('/admin/products');
  //   })
  //   .catch((err) => console.log(err));

  //method02
  // req.user
  //   .createProduct({
  //     title,
  //     imgUrl,
  //     description,
  //     price,
  //   })
  //   .then((product) => {
  //     console.log('Product Created.');
  //     res.redirect('/admin/products');
  //   })
  //   .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  //select method helps us to select only specific data from the db...
  //...with speicifying the fields we need and if we dont need any field..
  //..then specify the field with a hyphen (like if we dont need _id, include -_id)
  //populate method helps to populate the specified field with all available data for that field
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      console.log(products);
      return res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.loggedIn,
      });
    });
};

exports.getEditProduct = (req, res, next) => {
  let edited = req.query.edit;

  if (!edited) {
    return res.redirect('/');
  }
  const prodID = req.params.productID;
  //getProducts method provided by sequelize based on the tables & associations defined.
  Product.findById(prodID).then((product) => {
    if (!product) {
      res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: req.url,
      edited: true,
      product: product,
      errorMessage: '',
      validationErrors: [],
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productID, title, imgUrl, description, price } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add-Product',
      path: '/admin/edit-product',
      errorMessage: errors.array()[0].msg,
      product: { title, imgUrl, description, price, _id: productID },
      edited: true,
      validationErrors: errors.array(),
    });
  }
  //when we use mongoose findById method, mongoose returns a mongoose object instead of JS object as result
  //this momgoose object will have all mongoose methods like save() etc..
  Product.findById(productID)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title;
      product.imgUrl = imgUrl;
      product.description = description;
      product.price = price;
      return product.save().then((result) => {
        console.log('Updated product');
        res.redirect('/admin/products');
      });
    })

    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productID } = req.body;
  /*delete or destroy any product in the db by passing the query
  Product.destroy({ where: { id: productID } });*/

  //mongoose provides findByIdAndRemove method to find & delete an item from db
  //or we can use deleteOne method
  // Product.findByIdAndRemove(productID)
  Product.deleteOne({ _id: productID, userId: req.user._id })
    .then(() => {
      console.log('Item Deleted.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
