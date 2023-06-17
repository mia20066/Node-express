
//local strategy implementation
//passsport is an authentication middleware
const passport = require('passport'); //requiring passport middleware
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');//has access to the passportLocalMongoose plugin
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt; // this an object that will provide us with several helper methods such as extracting jwt-token from a request object
const jwt = require('jsonwebtoken');//used to create sign and verify tokens
const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate())); /* how to add a specific strategy plugin we want to use to our passport implemntation, and what we want to use is a strategy of local strategy
and this new instance of LocalStrategy requires a verify callback function that verifies username and password against the locally stored usernames and passwords
we will use the authenticate method provided by passportlocalmongoose plugin for that, which is a method on the user model*/


/* when a user has been successfully verified the user data have to be grapped from the session
and added to the request object there is a process called deserialization that need to happen
to that data in order for that to be possible when we recieve data about the user from the request
object and we need to convert it to store in the session data then a corresponding process called serialization needs to happen
so whenever we use session to passport we will need to serialize and deseialize the user instance */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/*a function that recieves an object that we will call user, this user object will contain an id for user document
inside the function we are returning a token created by jwt,sign()
this sign() methood is a part of the jsonwebtoken api*/
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    }
    else {
        const err = new Error('you are not authorized to perform this operation');
        res.status(403);
        return (err);
    }
}