//get,post.... are endpoints
//morgan middleware is logging to the console

const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');/*the last update we done to authenticate module
was to export a verify user function from it
what we are doing here is verify that the user is authenticated for every endpoint
in this router except for get endpoints because a get request is a simple read only operation
that doesnt change anything on the server side*/


//we will make updates to each endpoint in this file to interact with mongodb server through mongoose model methods

const campsiteRouter = express.Router();

campsiteRouter.route('/') // the slash means it is for campsite path
    //instead of all we will set  status code and headers for the various endpoints
    //.all((req, res, next) => {
    //  res.statusCode = 200;
    //res.setHeader('Content-Type', 'text/plain');
    //next();
    //})
    .get((req, res, next) => {
        Campsite.find()
        .populate('comments.author') //this will tell our application that when campsite's documents are retrieved to populate the author field of the comments sub-document by finding the user document that matches the object'sId that is stored there
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
            })
            .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

    })
    //authenticate.verifyUser is a middle ware function
    //and we are doing down on all endpoints means that the user needs to be authenticated in order to access those endpoints except the get ones
    .post(authenticate.verifyUser,(req, res, next) => {
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);

            })
            .catch(err => next(err));

    })
    .put(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId')
    //.all((req, res, next) => {
    //  res.statusCode = 200;
    //res.setHeader('Content-Type', 'text/plain');
    // next();
    //})
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author') 
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
            })
            .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

    })
    .post(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403
        res.end(`POST operation not supported on /campsites/ ${req.params.campsiteId} to you`);
    })
    .put(authenticate.verifyUser,(req, res) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true }) //we set new to true so we get information back about the updated document as the result from this method
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end/since it is in bson so we parse it to json
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
            })
            .catch(err => next(err));

    });


campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId) // to get the campsite document
        .populate('comments.author') 
            .then(campsite => {
                if (campsite) { //to make sure that a document is returned since it is possible for a null value to be returned
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
                }
                else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

    })
    .post(authenticate.verifyUser,(req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    //campsite.comments.push(req.body) changes only the comments array ithat is in the application memory and not
                    //the comments subdocument that is in mongodb database
                    //to actually save to mongodb database use: campsite.save()
                    req.body.author = req.user._id;//when the comment is saved it will have the id of the user who submitted the comment in the author field so later we can access it to populate this field
                    campsite.comments.push(req.body);//using an array method push to push the new comment into the comments array// here we are assuming the re.body have comment inside it
                    campsite.save()// return a promise that if resolves do what is below  
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                }
                else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err));

    })
    .put(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) { //wer are going to delete every comment in this campsites comment array
                        campsite.comments.id(campsite.comments[i]._id).remove();// remove each comment by its unique id
                    }

                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                }
                else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err));
    });



campsiteRouter.route('/:campsiteId/comments/:commentId')  // this will handle requests for specific comment for a specific campsite
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId) // to get the campsite document
        .populate('comments.author') 
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {  //check for campsite and comment if they are not null
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));//we passsed to .id() the id that was requested which is req.params.commentId
                }
                else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
                else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

    })
    .post(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);

    })
    .put(authenticate.verifyUser,(req, res, next) => {
        Campsite.findById(req.params.campsiteId) // to get the campsite document
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {  //check for campsite and comment if they are not null
                    if (req.body.rating) {
                        campsite.comments.id(req.params.commentId).rating = req.body.rating;

                    }
                    if (req.body.text) {
                        campsite.comments.id(req.params.commentId).text = req.body.text;
                    }
                    campsite.save() // if the save response succeed we will send the then to the client
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Conten-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));


                }
                else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
                else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err));

    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {  //check for campsite and comment if they are not null
                    campsite.comments.id(req.params.commentId).remove();
                    campsite.save() // if the save response succeed we will send the then to the client
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Conten-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));


                }
                else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
                else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err); // this will pass off this error to the express error handling mechanism
                }
            })
            .catch(err => next(err));
    });


module.exports = campsiteRouter;