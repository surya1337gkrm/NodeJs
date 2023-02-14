const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const bodyParser = require('body-parser');
const path = require('path');
//const expressHbs = require('express-handlebars');
const notFound = require('./controllers/pageNotFound');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
//we use connect-flash package to add error messages to the session and...
//...delete the data from the session when the data is used.
const flash = require('connect-flash');
//const { mongoConnect } = require('./util/database');
//const User = require('./models/user');
// const sequelize = require('./util/database');

// //importing the models to create the realtions between tables
const Product = require('./models/product');
const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cartItem');
// const Order = require('./models/order');
// const OrderItem = require('./models/orderItem');
const MONGODB_URI =
  'mongodb+srv://surya1337:Maddy%401337@cluster0.rzlttud.mongodb.net/shop?retryWrites=true&w=majority';
const app = express();
const store = new MongodbStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

//to use handlebars we need to set the engine first unlike pug
/*app.engine(
  'hbs',
  expressHbs({
    layoutsDir: 'views/layouts/',
    defaultLayout: 'mainLayout',
    extname: 'hbs',
  })
);*/
const csrfProtection = csrf();
//to use a dynamic html template engines, we need to set the engine name in the config.
app.set('view engine', 'ejs');
/*express will check for views/templates in the views directory but
if there's no views directory or with another name
add the directory where we stored the templates*/
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//add session middleware to start a session
app.use(
  session({
    secret: 'My Secret',
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);

//after initiating the session, we need to use the csrfProtection...
//...as the package will use this session to configure
app.use(csrfProtection);
app.use(flash());

//creating a middleware to make user accesible across the application
app.use((req, res, next) => {
  if (!req.session.user) {
    //if user isnt found in the session/logged out, then call next so that next code will not work.
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      //mongoose returns a mongoose object instead of a js obj which has all methods
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
  // next();
});

//in order to add common data to all requests we can add a new middleware
app.use((req, res, next) => {
  //on res, we have a property called locals which can be used to add required data...
  //...that can be fetched by all the views
  res.locals.isAuthenticated = req.session.loggedIn;
  //csrfToken method will be added to each req bcoz of the middleware
  res.locals.csrfToken = req.csrfToken();
  next();
});

//importing the routes from routes folder

/*if the url is /user/add-product and /user/product the instead of
app.use(), use app.use('/admin',adminRoutes)*/

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//handling page not found error
//after executing all possible routes, this middleware will be executed
//returns the 404 status code and response
app.use(notFound.getNotFound);

//creating the relations
//each produt will be created by an user

// mongoConnect(() => {
//   app.listen(3000);
// });
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    //findOne returns only one user based on the search params.
    //if no args are provided, it will return the first item in the db.
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'surya',
    //       email: 'surya@test.com',
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });
    app.listen(3000);
  })
  .catch((err) => console.log(err));
