var express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/user');
const { ReturnDocument } = require('mongodb');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();

router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
})
/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verfiyUser, authenticate.verifyAdmin, function(req, res, next) {
  Users.find({})
  .then(user => {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.json(user);
  })
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  Users.register(new User({ username: req.body.username }), 
    req.body.password, 
    (err, user) =>{
      console.log(user);
      if (err) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json');
        res.json({err: err});
      } else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            return res.json({ err: err });
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.json({ success: true, status: 'Registration Successful' });
          });
        });
      }
  })
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-type', 'application/json');
      return res.json({ success: false, status: 'Login failed!', err: info });
    }

    req.logIn(user, err => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-type', 'application/json');
        return res.json({ success: false, status: 'Login failed!', err: info });
      }

      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successfull!', token: token});
    });
  })(req, res, next);

});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (!req.session) {
    var err = new Error('You are not logged in!');
    err.status = 403; 
    next(err);
  } 
  
  req.session.destroy();
  res.clearCookie('session-id');
  res.redirect('/');
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user.id});
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('content-type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }

    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    return res.json({status: 'JWT valid!', success: true, user: user});    
  })(req, res, next);
}); 

module.exports = router;
