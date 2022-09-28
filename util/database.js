const Sequelize = require('sequelize');
//pass database name, rootusername, password and in thr object pass the sql type and host name
const sequelize = new Sequelize('node-complete', 'root', 'Maddy@1337', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
