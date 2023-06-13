//app.js is a file that handles most of the middleware
// var on const it doesnt matter but it is preffered to use const
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
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
app.use(cookieParser());

function auth(req, res, next) {
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
    return next(); // authorized
  }
  else {
    const err = new Error('You are not authenticated');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
  
}
//in incongnito window the browser wont cache my username and password

app.use(auth);

//we add authentication middleware before static middlewear because users needs to authenticate before they are able to access static files or any data in the server

app.use(express.static(path.join(__dirname, 'public')));// static middlewear to server static file such as image, aboutus page etc...

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
