const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
//const expressHbs = require('express-handlebars');

const notFound = require('./controllers/pageNotFound');

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

const bodyParser = require('body-parser');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//importing the routes from routes folder

/*if the url is /user/add-product and /user/product the instead of
app.use(), use app.use('/admin',adminRoutes)*/

app.use(adminRoutes);
app.use(shopRoutes);

//handling page not found error
//after executing all possible routes, this middleware will be executed
//returns the 404 status code and response
app.use(notFound.getNotFound);

app.listen(3000);
