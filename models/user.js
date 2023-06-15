const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    //we removed username and password because this down plugin is going to handle adding these fields to the document along with hashing and salting the password (one way encryption without going back)
   /* username:{
        type: String,
        required: true,
        unique:true

    },
    password: {
        type: String,
        required: true
    },*/


    /*we will use these firstname and lastname fields to demonstrate how we can use mongoose
    population to pull information from users documents and populate the comments subdocuments*/
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: '',
    },
    admin: {
        type: Boolean,
        default: false
    }
});
// plugging in the plugin
userSchema.plugin(passportLocalMongoose); //this plugin will also provide us with additional authentication methods on schema and model such as the authenticate method and

module.exports = mongoose.model('User', userSchema) //we give this model a name of User so the collection will automatically be named users











