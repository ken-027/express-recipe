var express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/user');
const { ReturnDocument } = require('mongodb');
const passport = require('passport');
const authenticate = require('../authenticate');

var router = express.Router();

/* GET users listing. */
router.get('/', authenticate.verfiyUser, authenticate.verifyAdmin, function(req, res, next) {
  Users.find({})
  .then(user => {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.json(user);
  })
});

router.post('/signup', (req, res, next) => {
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

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

router.get('/logout', (req, res, next) => {
  if (!req.session) {
    var err = new Error('You are not logged in!');
    err.status = 403; 
    next(err);
  } 
  
  req.session.destroy();
  res.clearCookie('session-id');
  res.redirect('/');
});

module.exports = router;
