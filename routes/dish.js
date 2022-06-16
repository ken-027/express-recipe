const express = require('express');
const bodyParser = require('body-parser');

const dishesRouter = express.Router();

dishesRouter.use(bodyParser.json());

dishesRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end('will send all dishes to you!');
    })
    .post((req, res, next) => {
        res.end(`will add the dish: ${req.body.name} \n with details: ${req.body.description}`);
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /dishes`);
    })
    .delete((req, res, next) => {
        res.end('Deleting all the dishes!');
    });

dishesRouter.route('/:dishId')
    .get((req, res, next) => {
        res.end(`Will send details of the dish: ${req.params.dishId}`);
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
    })
    .put((req, res, next) => {
        res.write(`Updating the dish: ${req.params.dishId} \n`);
        res.end(`Will update the dish: ${req.body.name} \n with details: ${req.body.description}`);
    })
    .delete((req, res, next) => {
        res.end(`Deleting dish: ${req.params.dishId}`);
    });

module.exports = dishesRouter;