const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishesRouter = express.Router();

dishesRouter.use(bodyParser.json());
//for dishes
dishesRouter.route('/')
.get((req, res, next) => {
    Dishes.find({})
    .then(dishes => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, (req, res, next) => {
    Dishes.create(req.body)
    .then(dish => {
        console.log('Dishes Created: ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /dishes`);
})
.delete(authenticate.verfiyUser, (req, res, next) => {
    Dishes.remove({})
    .then(resp => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(resp);
    }, err => next(err))
    .catch(err => next(err));
});

dishesRouter.route('/:dishId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
})
.put(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {
        new: true
    })
    .then(dish => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then(dish => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, err => next(err))
    .catch(err => next(err));
});

//for comments
dishesRouter.route('/:dishId/comments')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish === null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish === null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        dish.comments.push(req.body);
        dish.save()
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, err => next(err));
        res.json(dish.comments);
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /dishes/${req.params.dishId}/comments`);
})
.delete(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish === null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        for (var i = (dish.comments.length -1); i >= 0; i--) 
            dish.comments.id(dish.comments[i]._id).remove();
        
        dish.save()
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, err => next(err));

    }, err => next(err))
    .catch(err => next(err));
});

dishesRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish === null && dish.comments.id(req.params.commentId) === null) {
            var err = new Error(`Comment ${req.params.commentId} not found!`);
            err.status = 404;
            return next(err);
        } else if (dish === null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments.id(req.params.commentId));
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
})
.put(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish === null && dish.comments.id(req.params.commentId) === null) {
            var err = new Error(`Comment ${req.params.commentId} not found!`);
            err.status = 404;
            return next(err);
        } else if (dish === null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
        }
        if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
        }
        if (req.body.author) {
            dish.comments.id(req.params.commentId).author = req.body.author;
        }

        dish.save()
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, err => next(err));
        res.json(dish.comments);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verfiyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
        if (dish == null && dish.comments.id(req.params.commentId) == null) {
            var err = new Error(`Comment ${req.params.commentId} not found!`);
            err.status = 404;
            return next(err);
        } else if (dish == null) {
            var err = new Error(`Dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        dish.comments.id(req.params.commentId).remove();     
        dish.save()
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, err => next(err));

    }, err => next(err))
    .catch(err => next(err));
});

module.exports = dishesRouter;