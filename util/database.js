// const Sequelize = require('sequelize');
// //pass database name, rootusername, password and in thr object pass the sql type and host name
// const sequelize = new Sequelize('node-complete', 'root', 'Maddy@1337', {
//   dialect: 'mysql',
//   host: 'localhost',
// });

// module.exports = sequelize;

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (cb) => {
  MongoClient.connect(
    'mongodb+srv://surya1337:Maddy%401337@cluster0.rzlttud.mongodb.net/shop?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((client) => {
      _db = client.db();
      cb();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getdb = () => {
  if (_db) return _db;
  throw 'No Database found.';
};

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;
