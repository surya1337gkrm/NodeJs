const sequelize = require('../util/database');
const Sequelize = require('sequelize');

const orderItem = sequelize.define('orderItem', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
module.exports = orderItem;
