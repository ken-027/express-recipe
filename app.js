var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dish');
const leaderRouter = require('./routes/leader');
const promoRouter = require('./routes/promotion');

const Dishes = require('./models/dishes');

const dbhost = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(dbhost);

connect.then(db => {
  console.log('Connected successfully to the mongo server');
}, err => { console.log(err) });


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const auth = (req, res, next) => {
  console.log(req.headers);

  var authHeader = req.headers.authorization;

  if (!authHeader) {
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }

  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');

  var username = auth[0];
  var password = auth[1];

  if (!(username  === 'admin' && password === 'password')) {
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err); 
  } 
  next();
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
