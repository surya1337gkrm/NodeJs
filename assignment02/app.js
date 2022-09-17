const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.use('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
