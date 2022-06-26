const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verfiyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    // Favorites.find()
    .populate('dishes')
    .populate('user')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(favorite);
    }, err => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorite`);
})
.post(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .then(favorite => {
        if (favorite === null) {
            Favorites.create({
                user: req.user._id,
                dishes: req.body
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('content-type', 'application/json');
                res.json(favorite);
            }, err => next(err))
            .catch(err => next(err));
        }

        Favorites.findOneAndUpdate({ user: req.user._id }, {
            dishes: req.body
        }, {
            new: true
        })
        .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite); 
        }, err => next(err))
        .catch(err => next(err));
    });

})
.delete(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
    Favorites.findOneAndUpdate({ user: req.user._id }, { 
        dishes: [] 
    }, {
        new: true
    })
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite); 
    }, err => next(err))
    .catch(err => next(err));
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorite/${req.params.dishId}`);
})
.post(cors.cors, authenticate.verfiyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite !== null && favorite.dishes.indexOf(req.params.dishId) != -1) {
            res.statusCode = 409;
            res.setHeader('content-type', 'application/json');
            return res.json({ status: `Dish ${req.params.dishId} id is already on favorite list!` });
        }

        favorite.dishes.push(req.params.dishId);
        favorite.save()
        .then(favorite => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.json(favorite);
        }, err => next(err))
        .catch(err => next(err));
    }, err => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorite/${req.params.dishId}`);
})
.delete(cors.corsWithOptions, authenticate.verfiyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite === null) {
            var err = new Error(`Favorite dish ${req.params.dishId} not found!`);
            err.status = 404;
            return next(err);
        }

        var index = favorite.dishes.indexOf(req.params.dishId);
        favorite.dishes.splice(index, 1);
        favorite.save()
        .then(favorite => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.json(favorite);
        }, err => next(err))
        .catch(err => next(err));
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = favoritesRouter;