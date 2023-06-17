// creating user registration mechanism

const express = require('express');
const User = require('../models/user')
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');



/* GET users listing. */
router.get('/',authenticate.verifyUser,authenticate.verifyAdmin, function (req, res, next) {
User.find()
.then((users) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(users);
})
});
/* the passportLocalMongoose plugin provides us with methods that are useful for registering
and logging in users we can use these in place of the code that we implemented earlier 
we will rewrite the below code to use the passportlocalMongoose plugins register method as follows*/
router.post('/signup', (req, res) => {
  //statice method on user model
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
   (err, user) => { // the error returned from this register method would be if something internally went wrong while trying to register like an issue with the database configuration
    //also return a user document if the registration was successful
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
          res.json({ success: true, status: 'Registration Successful!' });

        });
      });
    }
  }
);
   });
  /* for session
   User.findOne({username: req.body.username})
   .then(user => {
     if (user) {
       const err = new Error(`User ${req.body.username} already exits!`);
       err.status = 403;
       return next(err);
     }
     else {
       User.create({
         username: req.body.username,
         password: req.body.password
       })
       .then(user => { // the create returns a promise  so we used the then method to handle the resolved value from the promise which should be the user document that was added
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({status: 'Registration Successful!', user: user}); // send a statues message of registration succesful along with a representation of user document
       })
       .catch(err => next(err));
     }
 })
 .catch(err => next(err)); //this deals with if findOne method returned a regected promise,a rejected promise doesnt mean that no users is found, it means something went wrong with findOne method, some error was encountered// we just that error pon express error handler*/


//after the signup path we passed for post a middleware function with req,res,next parameters
/*it is possible to insert multiple middleware functions in a routing method which is  passport.authenticate
this will enable passport authentication on this route and if there is no error with this middleware we will just continue on
to this next middlewarefunction(req, res)
the passport authenticate method will handle logging in the user for us
including challenging the user for credentials,parsing the credentials from the request body and all of that
 all we need here is send a response to the client
 if there any errors then password would have already taken care of it for us
 so we just need to set up a response if the login was successful*/
router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});//we pass the token we exported from authenticate a payload we just include in the payload the user id from the request object
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //once we have the token we include it in a response to the client
  res.json({success: true, token: token, status: 'You are successfully logged in!'});

  /* //we will check if the user is already logged in that is if already we are tracking an authenticated session for this user
   if (!req.session.user) { // that means the user is not logged in we need to handle the login
 
     const authHeader = req.headers.authorization;
 
     if (!authHeader) { // sending a challenge for basic authorization if there is no authorization header
       const err = new Error('You are not authenticated');
 
       res.setHeader('WWW-Authenticate', 'Basic');
       err.status = 401;
 
       return next(err);
     }
 
     const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');// once we have authorization header and we parse username and password from it, we are going to change user to username and pass to password to match the fields in the user document 
     const username = auth[0];
     const password = auth[1];
 // we will take the usename and password send by user and we will check them against the user dosument we have in our database
 User.findOne({username: username})
 .then(user => {
   if(!user){
   const err =new Error(`User ${username} does not exit`);
   err.status = 401;
   return next(err);
   }
   else if (user.password !== password){
     const err = new Error('Your password is incorrect!');
     err.status = 401;
     return next(err);
   } else if (user.username === username && user.password === password) {
     req.session.user = 'authenticated';
     res.statusCode = 200;
     res.setHeader('Content-Type', 'text/plain');
     res.end('You are authenticated');
   }
 })
 //if already the user is logged in
   } else {
     res.statusCode =200;
     res.setHeader('Content-Type', 'text/plain');
     res.end('You are already authenticated!')
   }*/

});


//deleteing a session
router.get('/logout', (req, res, next) => {
  if (req.session) {//if a session exists
    req.session.destroy();//deleting the session on the server side
    res.clearCookie('session-id');//we pass it the name of the session that we configured in app.js and we delete the cookie with this name
    res.redirect('/');//this will redirect the user to localhost:3000/

  } else { //this for if a session doesnt exists means a client is requesting to logout without being logged in
    const err = new Error('Youe are not logged in!');
    err.status = 401;
    return next(err);
  }
});




module.exports = router;
