// creating user registration mechanism

const express = require('express');
const User = require('../models/user')
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');



/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
User.find()
.then((users) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(users);
})
});

router.post('/signup', (req, res) => {
  
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
   (err, user) => { 
      if (err) {
        res.statusCode = 500; // internal server error
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err }); //which will provide the error from this property on the error object
        
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
           user.lasname= req.body.lastname;
        }
        user.save(err => {
          if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
      
        passport.authenticate('local')(req, res, () => { // req, res, and a callback function
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!' });

        });
      });
    }
  }
);
   });
 
router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});//we pass the token we exported from authenticate a payload we just include in the payload the user id from the request object
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //once we have the token we include it in a response to the client
  res.json({success: true, token: token, status: 'You are successfully logged in!'});

  

});


//deleteing a session
router.get('/logout', (req, res, next) => {
  if (req.session) { 
    req.session.destroy(); 
    res.clearCookie('session-id'); 

  } else { 
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});




module.exports = router;
