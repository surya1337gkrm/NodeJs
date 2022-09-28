const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products) =>
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
    })
  );
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productID;

  //we can use primary key to filter the product
  // Product.findByPk(prodId)
  //   .then((product) => {
  //     res.render('shop/product-detail', {
  //       pageTitle: product.title,
  //       path: req.url,
  //       prod: product,
  //     });
  //   })
  //   .catch((err) => console.log(err));

  //we can use findAll and include where condition to get the details of single product
  Product.findAll({ where: { id: prodId } })
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product[0].title,
        path: req.url,
        prod: product[0],
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then((products) =>
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    })
  );
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.id;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({
        where: {
          id: prodId,
        },
      });
    })
    .then((products) => {
      let product;
      if (products.length > 0) product = products[0];
      if (product) {
        // later
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: {
          quantity: newQuantity,
        },
      });
    })
    .then(() => res.redirect('/cart'))
    .catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodID = req.body.productID;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodID } });
    })
    .then((products) => {
      const product = products[0];
      //deletes thr product from the in-between tbale : cartItem
      return product.cartItem.destroy();
    })
    .then((result) => res.redirect('/cart'))
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => res.redirect('/orders'))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  //while fetching the orders, also include and ftech the products related to those orders
  req.user.getOrders({ include: ['products'] }).then((orders) => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: req.url,
      orders: orders,
    });
  });
};
