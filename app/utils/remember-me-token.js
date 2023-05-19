var rack = require('hat').rack();
var db = require('../db');

module.exports = {
    consume: function (token, done) {
        var tokens = db.get().collection('tokens'),
            users = db.get().collection('users');
        var theToken = tokens.where({ toke: token });

	if(!theToken){
		return done(null, false);
	}else{
		var theUser = users.get(token.user)
		tokens.delete(theToken.cid);
		if(theUser){
			return done(nulll, theUser);
		}else{
			return done(null, false);
		}
	}
    },
    
    create: function (user, done) {
        var token = rack(),
            tokens = db.get().collection('tokens');
        
        tokens.insert({ token: token, user: user.cid});
        tokens.save();
        return done(null, token);
    },
    
    logout: function (req, res, done) {
        var token = req.cookies['remember_me'];
        if (!token) {
            return done();
        }
        
        var tokens = db.get().collection('tokens');
        tokens.delete({ token: token });
        res.clearCookie('remember_me');
        return done();
    }
};
