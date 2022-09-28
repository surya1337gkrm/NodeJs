const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');
const path = require('path');
//const expressHbs = require('express-handlebars');
const notFound = require('./controllers/pageNotFound');
const sequelize = require('./util/database');

//importing the models to create the realtions between tables
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

const app = express();

//to use handlebars we need to set the engine first unlike pug
/*app.engine(
  'hbs',
  expressHbs({
    layoutsDir: 'views/layouts/',
    defaultLayout: 'mainLayout',
    extname: 'hbs',
  })
);*/

//to use a dynamic html template engines, we need to set the engine name in the config.
app.set('view engine', 'ejs');
/*express will check for views/templates in the views directory but
if there's no views directory or with another name
add the directory where we stored the templates*/
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//creating a middleware to make user accesible across the application
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//importing the routes from routes folder

/*if the url is /user/add-product and /user/product the instead of
app.use(), use app.use('/admin',adminRoutes)*/

app.use('/admin', adminRoutes);
app.use(shopRoutes);

//handling page not found error
//after executing all possible routes, this middleware will be executed
//returns the 404 status code and response
app.use(notFound.getNotFound);

//creating the relations
//each produt will be created by an user
Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
});
//users can have many products created
User.hasMany(Product);
//many to many relation
Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });

//user to cart relations
User.hasOne(Cart);
Cart.belongsTo(User);

//order and orderItem tables associations
User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });

//create the tables in the db
sequelize
  //if i want to override the tables, use force:true
  //.sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: 'Surya Venkatesh',
        email: 'suryavenkatesh@gmail.com',
      });
    }
    return user;
  })
  .then((user) => {
    //checking if there's a crt for the user and if there isn't creating a new cart and return the promise
    return user
      .getCart()
      .then((cart) => {
        if (!cart) {
          return user.createCart();
        }
        return cart;
      })
      .catch((err) => console.log(err));
  })
  .then((cart) => {
    //console.log(result);
    //start the app only if there's no error in creating the tables in the db
    app.listen(3000, () => {
      console.log('Listening on port 3000');
    });
  })
  .catch((err) => console.log(err));

//as we aren't checking for the existing cart for an user, so new carts will be created for each user
//either include a check for the cart for the user or modify the cart model and add a field userId:{id:Sequelize.Integer,unique:true}
