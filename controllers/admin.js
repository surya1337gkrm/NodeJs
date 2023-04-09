const Product = require('../models/product');
const mongodb = require('mongodb');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');
//findByID() in sequelize is replaced with findByPk()

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add-Product',
    path: '/admin/add-product',
    product: {
      title: '',
      price: '',
      description: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  //default encoding type for a form will be x-www-urlencoded in which data from the from  will be sent along with the
  //url as text. if we want to send a binary data like image etc... it will not work.
  //for that to work, we need to use encoding type as multipart/form-data
  // const { title, imgUrl, description, price } = req.body;
  const title = req.body.title;
  //instead of reading data from req.body, check in req.file - incoming input file...
  //will be received in a binary format.
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add-Product',
      path: '/admin/add-product',
      errorMessage: 'Attached file is not an image.',
      product: { title, description, price },
      validationErrors: [],
    });
  }

  const product = new Product({
    title,
    description,
    imgUrl: image.path,
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
      product: { title, description, price },
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
  const { productID, title, description, price } = req.body;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add-Product',
      path: '/admin/edit-product',
      errorMessage: errors.array()[0].msg,
      product: { title, description, price, _id: productID },
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
      product.description = description;
      //only update the image only if provided, or use previous image
      if (image) {
        fileHelper.deletFile(product.imgUrl);
        product.imgUrl = image.path;
      }
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
  Product.findById(productID)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      fileHelper.deletFile(product.imgUrl);
      return Product.deleteOne({ _id: productID, userId: req.user._id });
    })

    //mongoose provides findByIdAndRemove method to find & delete an item from db
    //or we can use deleteOne method
    // Product.findByIdAndRemove(productID)
    .then(() => {
      console.log('Item Deleted.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
