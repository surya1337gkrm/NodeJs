const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');

router.get('/login', authController.getLogin);
//use sanitization methods to store thr data uniquely[trim extra whote spaces/convert to standard format etc..]
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid Email')
      .normalizeEmail(),
    body(
      'password',
      'Password should contain atleast 5 alphanumeric charecters'
    )
      .isLength({ min: 5 })
      .trim(),
  ],
  authController.postLogin
);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
//add validation middleware
//if multiple fileds has to be checked, pass the field names as an array
// router.post(
//   '/signup',
//   check('email').isEmail().withMessage('Please Enter a Valid E-Mail.'),
//   authController.postSignup
// );

//if we need to write additional validation, we can do that by chaining a custom method and write the validation logic as a callback fn
//if we have multiple validations to be done, we can write multiple middlewares and group them by including them in an array.
//_____________________________________________________
//By uisng check method, it will check for the specific field in req.body,query params,url params etc
//to check only in specific property like body, import those methods from validator library
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please Enter a Valid E-Mail.')
      .normalizeEmail()
      .custom((value, obj) => {
        //second argument is an object which has all the data related to thr incoming request
        //if we dont want to allow test@test.com as email
        // if (value === 'test@test.com') {
        //   throw new Error('This email is forbidden.');
        // }
        // return true;
        // as finding an item in db is an async operation,express-validator will look for custom method to return a
        // boolean value or a promise rejected and uses this response as an error
        return User.findOne({ email: value }).then((_user) => {
          if (_user) {
            return Promise.reject('Email already Exists. Choose a new Email.');
          }
        });
        //return true to return the previous error messages.
      }),
    //   instead of writing multiple error messages for each validator chained, we can pass a common message
    //   as second argument to the body function and we can use as error message
    body(
      'password',
      'Enter a password with atleast 5 characters and should be alphanumeric only.'
    )
      .isLength({
        min: 5,
      })
      .trim(),
    //   .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password should Match.');
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
