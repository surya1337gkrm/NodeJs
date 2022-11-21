const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');
const path = require('path');
//const expressHbs = require('express-handlebars');
const notFound = require('./controllers/pageNotFound');
const { mongoConnect } = require('./util/database');
const User = require('./models/user');
// const sequelize = require('./util/database');

// //importing the models to create the realtions between tables
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cartItem');
// const Order = require('./models/order');
// const OrderItem = require('./models/orderItem');

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
  User.findUserById('6344fbfdb1835f6d03b63b2a')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
  // next();
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

mongoConnect(() => {
  app.listen(3000);
});
