const twofactor = require("node-2fa");

const newSecret = twofactor.generateSecret({ name: "My Awesome App", account: "johndoe" });
console.log(newSecret);
/*
{ secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
  uri: 'otpauth://totp/My%20Awesome%20App:johndoe?secret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W&issuer=My%20Awesome%20App',
  qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My%20Awesome%20App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W%26issuer=My%20Awesome%20App'
}
*/

const newToken = twofactor.generateToken(newSecret.secret);
console.log(newToken);
// => { token: '630618' }

var check = twofactor.verifyToken(newSecret.secret, newToken.token);
console.log(check);
// => { delta: 0 }

check = twofactor.verifyToken(newSecret.secret, "1234");
console.log(check);
// => null
