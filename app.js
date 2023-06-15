//app.js is a file that handles most of the middleware
// var on const it doesnt matter but it is preffered to use const
var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const session = require('express-session');
//const FileStore = require('session-file-store')(session);// we have 2 sets of parameter after a function call
//the require function here is returning another function session-file-store as its retun value then immediatly we are calling that return function with the second parameter list of session
const passport = require('passport');
//const authenticate = require('./authenticate');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const mongoose = require('mongoose');

//const url = 'mongodb://localhost:27017/nucampsite';
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err) // another way to handle errors other than catch
); // establishing the connection to mongodb server

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//the middleware used in our app they are applied in the same order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//we comment cookieParser because no longer we are using it we are using sesssions
//app.use(cookieParser('12345-67890-09876-54321'));//secrete key(it can be anything) inside the cookie parser in order to be used by cookie parser  in order to encrypt the information and sign the cookie that is sent from the server to the client





/*app.use(session({
  name: 'session-id', //it can be any name
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, // when a new session is created  but then no updates is made to it then at the end of the request it wont get saved becuase it will just be an empty session without any useful information and also no cookie will be sent to the client, that helps preventing having a bunch of  empty session files and cookies being set up
  resave: false,//once the session been created and updated and saved it will continue to be resaved whenever a request made to that session even if that request didnt make any updated that needed to be saved, this will help mainly the session marked as active so it doesnt get deleted while the user still making requests 
  store: new FileStore() // will create a new filestore as an object that we can use to save our session's information to the server's hard disk instead of just in the running application memory  
}));*/

/*these are only necessary if you are using session based authentication, these are 2 middleware functions
provided by passport to check incoming requests to see if there is an existing session for that
client then if so the session data for that client is loaded into the request as req.user
and we will use this next in the suth function*/
app.use(passport.initialize());
//app.use(passport.session());



//using cookie
/*
function auth(req, res, next) {
  if (!req.signedCookies.user) { // if the user didnt sign the cookie properly or there is no signed cookie
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    // if the authHeader is null that means we didnt get any aythentication information in this request, that means the client didnt put username and password yet
    if (!authHeader) {
      const err = new Error('You are not authenticated');

      res.setHeader('WWW-Authenticate', 'Basic'); //this lets the client know that the server is requesting authentication and that the authentication method being requested is basic
      err.status = 401;
      //we pass the error message to express to handle sending the error message an authentication request back to the client
      return next(err);
    }
    //now because we set the response header to request authentication the server will not only send the error mesasage back
    //but also challenges the client for credentials and if the client response to that challange
    //the response will come back to this auth function and the process will begin again
    //but this time hopefully  there is an authorization header
    //when there is an authorization header we can skip to the next part
    //HERE we will parse the authorization header and validate the username and password
    //authorization header formate (Basic username+password) in a base64 encoded string 
    //when the username and password are decoded  are shown  separted by a colon example admin:password
    //so we parse the username and password out from the header and put them in array ['admin','password']

    //Buffer is one of the few globals and node meaning we dont need to require it or anything to use it , we can just use it and it has a static method from which we will use to decode the username and password
    //so this code will take the authorization header and extract the username and password from it and pu them in the auth array as the first and second items
    // Buffer is from node.js , split/toString/from are from  vanilla javascript
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {
      //this res.cookie method handles creating the cookie and setting it up in the server response to  the client 
      res.cookie('user', 'admin', {signed: true}); //the res.cookie method is a part of expresse's response object api, we will use it to create a new cookie by passing it a name that we want to use for the cookie user and this name will be used to set up a property of user on the sign cookie object, the second argument will be a value to store in the name property will give that a string of admin, the third argument is optionl and is an object that contains configuration values, in this case by setting the property of signed to true we let express to use the secrete key from the cookie parser to crete a signed cookie

      return next(); // authorized
    }
    else {
      const err = new Error('You are not authenticated');
      res.setHeader = ('WWW-Authenticate', 'Basic');// challenging user for credentials
      err.status = 401;
      return next(err);
    }
  }
    else {
      if (req.signedCookies.user === 'admin') {
        return next();


      } else {
        const err = new Error('You are not authenticated');
     
      err.status = 401;
      return next(err);
      }
      }
    }

//in incongnito window the browser wont cache my username and password
*/

//we placed them before auth function because we want the users to be able to access userRouter before they get challenged to authenticate themselves so that if they dont have an account they can create one
//with respect to indexRouter we want unauthenticated users to acess indexRouter as well
app.use('/', indexRouter);
app.use('/users', usersRouter);


//using session

/*function auth(req, res, next) {
  console.log(req.user)
  if (!req.user) {// no session loaded for this client
//we get red of the two lines below because they are now handled by userRouter
   // const authHeader = req.headers.authorization;

   // if (!authHeader) {
    //all what we are checking here is the client  not authenticated that is doesnt have a session with a user field , if it doesnt we can just use this error handling setup
      const err = new Error('You are not authenticated');
     // res.setHeader('WWW-Authenticate', 'Basic'); we no longer handle this here we do it in the userRouter 
      err.status = 401;
      return next(err);
  
  
    
  }
  else {
    //if (req.session.user === 'authenticated') {  //suthenticated is the value we set for userRouter when user logged in
      return next(); // if authenticated we will pass this user to the next middleware


  }
}


// this above all we need to make a session, everything else including generating the cookie for use in the session will be handled by the express sessions middleware


app.use(auth);*/

//we add authentication middleware before static middlewear because users needs to authenticate before they are able to access static files or any data in the server

app.use(express.static(path.join(__dirname, 'public')));// static middlewear to server static file such as image, aboutus page etc...


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
