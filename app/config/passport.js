var db = require('../db');
var bcrypt = require('bcrypt-nodejs');
var tokenStorage = require('../utils/remember-me-token');
var GoogleAuthenticator = require('passport-2fa-totp').GoogeAuthenticator;
var TwoFAStartegy = require('passport-2fa-totp').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;

module.exports = function (passport) {
    var INVALID_LOGIN = 'Invalid username or password';

    passport.serializeUser(function (user, done) {
        console.log("serialize");
	console.log(user);
        return done(null, user.cid);
    });

    passport.deserializeUser(function (cid, done) {
        var users = db.instance.collection('users');
	var theUser = users.get(cid);
	console.log("deserialize");
	console.log(theUser);
	if(typeof(theUser.username) !== 'undefined'){
		return done(null, theUser);
	}else{
		return done(null, false);
        }
    });

    passport.use('login', new TwoFAStartegy({
        usernameField: 'username',
        passwordField: 'password',
        codeField: 'code'
    }, function (username, password, done) {
        // 1st step verification: username and password

        process.nextTick(function () {
            var users = db.instance.collection('users');
	    var theUser = users.where({username: username}).items[0];
	    console.log("login user");
            console.log(theUser);
	    if(typeof(theUser.username) === 'undefined'){
		return done(null, false, {message: INVALID_LOGIN});
	    }

		bcrypt.compare(password, theUser.password, function (err, result) {
                    if (err) {
                        return done(err);
                    }

                    if (result === true) {
                        return done(null, theUser);
                    } else {
                        return done(null, false, { message: INVALID_LOGIN });
                    }
                });
        });
    }, function (user, done) {
        // 2nd step verification: TOTP code from Google Authenticator

        if (!user.secret) {
            done(new Error("Google Authenticator is not setup yet."));
        } else {
            // Google Authenticator uses 30 seconds key period
            // https://github.com/google/google-authenticator/wiki/Key-Uri-Format

            var secret = GoogleAuthenticator.decodeSecret(user.secret);
            done(null, secret, 30);
        }
    }));

    passport.use('register', new TwoFAStartegy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
        skipTotpVerification: true
    }, function (req, username, password, done) {
        // 1st step verification: validate input and create new user
        if (!/^[A-Za-z0-9_]+$/g.test(req.body.username)) {
            return done(null, false, { message: 'Invalid username' });
        }
        if (req.body.password.length === 0) {
            return done(null, false, { message: 'Password is required' });
        }
        if (req.body.password !== req.body.confirmPassword) {
            return done(null, false, { message: 'Passwords do not match' });
        }

        var users = db.instance.collection('users');
        console.log("users db");
	console.log(users);
        console.log("_._");

	var theUser = users.where({username: username}).items;
	console.log("selected user");
	console.log(theUser);
	console.log("°v°");

	if (theUser.lenght > 0 && typeof(theUser[0].username) !== 'undefined'){
		return done(null, false, {message: 'Username already exists.'});
	}

        bcrypt.hash(password, null, null, function (err, hash) {
           if (err) {
               console.log(err);
               return done(err);
           }
                var user = {
                    username: username,
                    password: hash
                };
                users.insert(user);
		users.save();
		var theUser = users.where({username: user.username}).items[0];
		console.log("new user");
		console.log(theUser);
		console.log("[>>>");
		console.log("users db after inser of new user:");
		console.log(users.items);
		console.log(">>>]");
                return done(null, theUser);
       });
    }));

    passport.use(new RememberMeStrategy(function (token, done) {
        process.nextTick(function() {
            tokenStorage.consume(token, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user === false) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            });
        });
    },
    function (user, done) {
        process.nextTick(function() {
            tokenStorage.create(user, done);
        });
    }));
};
