require('dotenv').config()
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const passport = require('passport')

const authenticate = require('./authenticate')
const config = require('./config');

var indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const dishRouter = require('./routes/dish')
const leaderRouter = require('./routes/leader')
const promoRouter = require('./routes/promotion')
const uploadRouter = require('./routes/upload')
const favoriteRouter = require('./routes/favorite')
const commentRouter = require('./routes/comment')

const Dishes = require('./models/dishes')

const connect = mongoose.connect(config.mongoUrl)

connect.then(
  (db) => {
    console.log('Connected successfully to the mongo server')
  },
  (err) => {
    console.log(err)
  },
)

var app = express()

// app.all('*', (req, res, next) => {
//   if (req.secure)
//     return next();
//   res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize())

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/dishes', dishRouter)
app.use('/comments', commentRouter)
app.use('/leaders', leaderRouter)
app.use('/promotions', promoRouter)
app.use('/favorites', favoriteRouter)
app.use('/imageUpload', uploadRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', { title: 'Node API' })
})

module.exports = app
