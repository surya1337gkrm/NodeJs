const Product = require('../models/product');
const mongodb = require('mongodb');
//findByID() in sequelize is replaced with findByPk()

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
  const product = new Product({
    title,
    imgUrl,
    description,
    price,
    //we can either pass req.user._id [id specifically] or mongoose will directly take id from the user object we passed.
    userId: req.user,
  });
  //mongoose model Product do have a save method defined
  //which saves the data to the mongoDB and returns a promise
  product
    .save()
    .then((result) => {
      console.log('Product added.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
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
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      console.log(products);
      return res.render('admin/products', {
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
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productID, title, imgUrl, description, price } = req.body;
  //when we use mongoose findById method, mongoose returns a mongoose object instead of JS object as result
  //this momgoose object will have all mongoose methods like save() etc..
  Product.findById(productID)
    .then((product) => {
      product.title = title;
      product.imgUrl = imgUrl;
      product.description = description;
      product.price = price;
      return product.save();
    })
    .then((result) => {
      console.log('Updated product');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productID } = req.body;
  /*delete or destroy any product in the db by passing the query
  Product.destroy({ where: { id: productID } });*/

  //mongoose provides findByIdAndRemove method to find & delete an item from db
  Product.findByIdAndRemove(productID)
    .then(() => {
      console.log('Item Deleted.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
