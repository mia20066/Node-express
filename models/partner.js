const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//create Schema
const partnerSchema = new Schema({ //extentiate a new object called campsite schema
    name: {
        type: String,
        required: true,
        unique: true //no 2 campsites should have same name
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    
   
    featured: {
        type: Boolean,
        default: false
    },
    
  

}// first argument

    , {
        timestamps: true // second argument

    });

// create a model using this schema
//this create a model name Campsite with capital C, and the first argument we give it to it should be a capitalized and singular version of the name of the collection i want to use for this model(here we sre using the collection from campsites but we write it Campsite) the second argument the schema we want to use for this collection
// the return value is a constructor function, this model is a desugered class
//classes instantiate objects , the model is same way working it instantiate documents for mongodb
const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;