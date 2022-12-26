const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  //   name: {
  //     type: String,
  //     required: true,
  //   },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    //if we need to store an array of strings we can denote it like `items:[String]`
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

//to add static methods to a model use schema.methods.add
//we should only use function syntax instead of arrow, to make sure that 'this' will...
//...refer to the current user object.
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );
  let updatedCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      //mongoose will convert the id to mongoDB ID in the sub array data too...
      //...so we can just pass the id as a string instead of converting to mongoDB id
      productId: product._id,
      quantity: 1,
    });
  }

  //updating the cart if the product is not there in the cart
  const updatedCart = {
    items: updatedCartItems,
  };
  //to save the updated cart, we can use the save method on the current user object
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (el) => el.productId.toString() !== productId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

//-----------------Using MongoDB Package-------------------------

// const mongodb = require('mongodb');
// //const { getdb } = require('../util/database');
// const Product = require('./product');
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; //{items:[]}
//     this._id = id;
//   }

//   save() {
//     const db = getdb();
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     const db = getdb();
//     //get the index of the product if it already exists in the cart to update the Quantity

//     //product which we receieve as an argument, will have id as a string
//     //and it is compared with the cp.productId which is of type mongodb.ObjectId
//     //so either use two euqlas / convert both of them to string using .toString()
//     const cartProductIndex = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === product._id.toString()
//     );
//     let updatedCartItems = [...this.cart.items];
//     let newQuantity = 1;

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: 1,
//       });
//     }

//     //updating the cart if the product is not there in the cart
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     db.collection('users').updateOne(
//       { _id: new mongodb.ObjectId(this._id) },
//       { $set: { cart: updatedCart } }
//     );
//   }

//   getCart() {
//     const db = getdb();
//     const productIds = this.cart.items.map((el) => el.productId);
//     //to search for multiple id's, we can use $in
//     // $in -> pass list of id's so that mongo will search for all id's included
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(
//               (el) => el.productId.toString() === product._id.toString()
//             ).quantity,
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(
//       (el) => el.productId.toString() !== productId.toString()
//     );
//     const db = getdb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getdb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.name,
//             email: this.email,
//           },
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getdb();
//     return db
//       .collection('orders')
//       .find({
//         'user._id': new mongodb.ObjectId(this._id),
//       })
//       .toArray();
//   }

//   static findUserById(userId) {
//     const db = getdb();
//     return db
//       .collection('users')
//       .findOne({ _id: new mongodb.ObjectId(userId) });
//   }
// }
// module.exports = User;
