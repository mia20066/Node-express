//unique that means no 2 documents in this colllection should have same name
//timestampsto: true which cause mongoose to automatically add two properties to the schema called created at and updated at with time it is created and mongoose will mangae these properties for us

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose) // this will load new currency type into mongoose so it is available to mongoose schemas to use
const Currency = mongoose.Types.Currency;


const commentSchema = new Schema({      // it will be used for documents storing comments about a campsite
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true

    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, //we store a refrence to a user document through user document objectId
        ref: 'User' //will hold the name of the model for that document which is User
    }
},{
    timestamps: true
}
);
//create Schema
const campsiteSchema = new Schema({ //extentiate a new object called campsite schema
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
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    }, 
    featured: {
        type: Boolean,
        default: false
    },
    
    //we will add a schema a sa subdocuments inside campsiteSchema
      comments: [commentSchema]

}// first argument

    , {
        timestamps: true // second argument

    });

// create a model using this schema
//this create a model name Campsite with capital C, and the first argument we give it to it should be a capitalized and singular version of the name of the collection i want to use for this model(here we sre using the collection from campsites but we write it Campsite) the second argument the schema we want to use for this collection
// the return value is a constructor function, this model is a desugered class
//classes instantiate objects , the model is same way working it instantiate documents for mongodb
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;
