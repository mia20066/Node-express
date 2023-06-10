const express = require('express');
const promotionRouter = express.Router();
const Promotion = require('../models/promotion');

promotionRouter.route('/')
.get((req, res, next) => {
    Promotion.find()
        .then(promotions => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
        })
        .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

})
.post((req, res, next) => {
    Promotion.create(req.body)
        .then(promotion => {
            console.log('Promotion Created ', promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);

        })
        .catch(err => next(err));

})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    Promotion.deleteMany()
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err));
});








promotionRouter.route('/:promotionId')
    
    .get((req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
            })
            .catch(err => next(err)); // what will this do is passing the error to the overall error handler for this express application

    })
    .post((req, res) => {
        res.statusCode = 403
        res.end(`POST operation not supported on /promotions/ ${req.params.promotionId} to you`);
    })
    .put((req, res) => {
        Promotion.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true }) //we set new to true so we get information back about the updated document as the result from this method
            .then(promotion => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end/since it is in bson so we parse it to json
            })
            .catch(err => next(err));
    })
    .delete((req, res, next) => {
        Promotion.findByIdAndDelete(req.params.promotionId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);// this method will send json data to the client in the response stream, and it will automatically close the responce stream afterward so no need for the down res.end
            })
            .catch(err => next(err));

    });
module.exports = promotionRouter;