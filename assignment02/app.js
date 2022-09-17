const app = require('express')();


app.use('/add-product', (req, res, next) => {
  res.send('Response from users');
});

app.use('/', (req, res, next) => {
  console.log('Root Route');
  res.send('<h1>Root Route</h1>');
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
