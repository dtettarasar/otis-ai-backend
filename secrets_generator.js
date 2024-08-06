/*
use it via the following command : 
npm run token-secret
This small script will generate secret to use with JSON Web Token, and the cookie signature
get your secrets and store them in the .env file, using these 2 variable names: 
- ACCESS_TOKEN_SECRET="your access token secret"
- REFRESH_TOKEN_SECRET="your refresh token secret"
*/

const generator = (sizeInt) => {

    const str = require('crypto').randomBytes(sizeInt).toString('hex');
    return str

}

const accessSecret = generator(64);
const refreshSecret = generator(64);
const cookieSecret = generator(32);
const encryptionKey = generator(16);

const instructions = `
This small script will generate secret to use with JSON Web Token, and the cookie signature. 
get your secrets and store them in the .env file:`

console.log(instructions);
console.log("ACCESS_TOKEN_SECRET='"+ accessSecret + "'");
console.log("REFRESH_TOKEN_SECRET='"+ refreshSecret + "'");
console.log("COOKIE_SIGNATURE_SECRET='" + cookieSecret + "'");
console.log("ENCRYPTION_KEY='" + encryptionKey + "'");

console.log("------------");