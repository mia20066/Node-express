const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
   
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});
// plugging in the pluginkn
userSchema.plugin(passportLocalMongoose); //this plugin will also provide us with additional authentication methods on schema and model such as the authenticate method and

module.exports = mongoose.model('User', userSchema) //we give this model a name of User so the collection will automatically be named users











