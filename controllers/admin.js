const Product = require('../models/product');
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
  req.user
    .createProduct({
      title,
      imgUrl,
      description,
      price,
    })
    .then((product) => {
      console.log('Product Created.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts().then((products) =>
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    })
  );
};

exports.getEditProduct = (req, res, next) => {
  let edited = req.query.edit;

  if (!edited) {
    return res.redirect('/');
  }
  const prodID = req.params.productID;
  //getProducts method provided by sequelize based on the tables & associations defined.
  req.user
    .getProducts({
      where: {
        id: prodID,
      },
    })
    .then((products) => {
      const product = products[0];
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
  Product.findByPk(productID)
    .then((product) => {
      product.title = title;
      product.imgUrl = imgUrl;
      product.price = price;
      product.description = description;
      //save method updates the data in the db and returns a promise
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

  Product.findByPk(productID)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log('Item Deleted.');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
