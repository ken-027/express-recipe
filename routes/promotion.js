const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions');
const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.get((req, res, next) => {
    Promotions.find({})
    .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then(promotion => {
        console.log('Promotions Created: ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, err => next(err))
    .catch(err => next(err));
})
.put(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /promotions`);
})
.delete(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
    .then(resp => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, err => next(err))
    .catch(err => next(err));
});

promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotions.findById(req.params.promotionId)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(promotion);
    }, err => next(err))
    .catch(err => next(err));
})
.post(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
})
.put(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, {
        new: true
    })
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(promotion);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(authenticate.verfiyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(promotion);
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = promotionRouter;