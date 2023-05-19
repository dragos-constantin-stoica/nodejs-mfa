/*
 * db wrapper
 */
var locallydb = require('locallydb');

const db = {};

db.initialize = function () {
  db.instance = new locallydb('./db');
  db.users = db.instance.collection('users');
};

db.isValidUser = function (email, hashedPassword) {
  const user = db.getUser(email, hashedPassword);
  return user.email !== undefined;
};

db.getUser = function (email) {
  const result = db.users.where({ email: email });
  if (userExists(result)) {
    return result.items[0];
  }
  return undefined;
};

db.getCleanedUser = function (email) {
  const result = db.users.where({ email: email });
  if (userExists(result)) {
    const user = result.items[0];
    return {
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }
  return undefined;
};

db.addUser = function (email, hashedPassword) {
  const user = db.getUser(email);
  if (typeof user === 'undefined' || typeof user.email === 'undefined') {
    db.users.insert({
      email: email,
      password: hashedPassword,
      twoFactorEnabled: false,
      twoFactorSecret: '',
    });
  }
};

db.updateUserSecret = function (email, secret) {
  const result = db.users.where({ email: email });
  if (userExists(result)) {
    const cid = result.items[0].cid;
    db.users.update(cid, { twoFactorSecret: secret });
  }
};

db.enableTwoFactorAuthentication = function (email, secret) {
  const result = db.users.where({ email: email });
  if (userExists(result)) {
    const cid = result.items[0].cid;
    db.users.update(cid, { twoFactorEnabled: true, secret: secret });
  }
};


db.get =function(){
	return db.instance;
}

db.connect = function(url, done){
	if(db.instance) return done(null, db.instance);
	db.initialize();
	if(db.instance){
		return done(null, db.instance);
	}else{
		return done("Could not create locally DB!");
	}
}

db.close = function(done){
	if(!db) return done("Could not close locally DB!");
	db = {};
	done(null);
}

function userExists(result) {
  if (
    typeof result != 'undefined' &&
    typeof result.items != 'undefined' &&
    result.items.length > 0 &&
    typeof result.items[0].email !== 'undefined'
  ) {
    return true;
  }
  return false;
}

module.exports = db;
