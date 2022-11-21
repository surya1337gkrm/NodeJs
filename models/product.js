const { getdb } = require('../util/database');
const mongodb = require('mongodb');

class Product {
  constructor(title, price, description, imgUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imgUrl = imgUrl;
    // if id isnt passed, while intiiating a product, id will be undefined so using
    // ternary operation change id to null and mongodb will automatically creates an ID.
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getdb();
    // if there's an id, edit the data and if not there, save data to the db
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }

    return dbOp
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
  static fetchAll() {
    //toArray should be only used when db consists less data
    //use pagination (limit data ) if there's huge data in db.
    //find returns a cursor object which we can use to point the next data
    const db = getdb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => products)
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    //mongodb stores id's as a objectId datatype specific to mongodb
    //to convert our string id to mongo type, we use constructor method provided by mongo
    const db = getdb();
    //returns a cursor which points to next object. so use next() method to get the object.
    return db
      .collection('products')
      .find({
        _id: new mongodb.ObjectId(prodId),
      })
      .next()
      .then((product) => product)
      .catch((err) => console.log(err));
  }

  static deleteProduct(prodId) {
    const db = getdb();
    return db
      .collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }
}
module.exports = Product;
