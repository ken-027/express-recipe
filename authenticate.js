const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => (jwt.sign(user, config.secretKey, {expiresIn: 3600}));

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // console.log("JWT Payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) 
            return done(err, false);
        else if (user) 
            return done(null, user);
        return done(null, false);
    });    
}));

exports.verifyAdmin = (req, res, next) => {
    if (!req.user.admin) {
        var err = new Error(`you are not authorize to proceed with this process`);
        err.status = 401;
        return next(err);
    }
    next();
}   

exports.verfiyUser = passport.authenticate('jwt', {session: false});

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {   
        User.findOne({ facebookId: profile.id }, (err, user) => {
            if (err)
                return done(err, false);
            if (!err && user !== null) 
                return done(null, user);
            else {
                var user = new User({ username: profile.displayName });
                console.log('User Profile: ', profile);
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err) return done(err, false);
                    return done(null, user);
                });
            }
        });
    }
));