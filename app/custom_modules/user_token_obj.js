const env = require('dotenv').config();
const strHasher = require('./str_hasher');
const strEncrypter = require('./str_encrypter');
const jwt = require("jsonwebtoken");
const dataBaseObj = require('./database_obj');

// todo : handle the expirationTime in .env file

const userTokenObj = {

    async checkUserLogin(usernameToCheck, passwordToCheck) {

        const userLoginData = {
            authSuccess: false,
            userIdEncryption: {}
        }

        console.log('init checkUserLogin from userTokenObj');

        const usernameInDB = await dataBaseObj.findUserByName(usernameToCheck);

        if (usernameInDB.length === 0) {

            console.log('Error: invalid username');

        } else {

            console.log('User exist in DB');
            const userToCheckAuth = usernameInDB[0];
            const hashObj = await dataBaseObj.getUserPsw(userToCheckAuth._id);

            const checkHash = await strHasher.method.checkHash(passwordToCheck, hashObj.password);

            if (!checkHash) {

                console.log('Error: invalid password');

            } else {

                console.log('Password is valid, auth OK');
                userLoginData.authSuccess = true;

                // make an encrypted version of the id that will be passed to the token before its creation
                userLoginData.userIdEncryption = await strEncrypter.method.encryptString(userToCheckAuth._id.toHexString());

            }

        }

        console.log(userLoginData);
        return userLoginData;

    },

    async createToken (user, secretKey, expirationTime) {

        // Get the user for which we create the token
        // Data filled by the user on the login form

        try {

            const accessToken = jwt.sign(user, secretKey, {expiresIn: expirationTime});
            return accessToken;

        } catch (err) {

            console.error("create token error: " + err);
            return false;

        }
    },

    authToken (token, secretKey) {

        //console.log('init authToken method');

        const authTokenObj = {
            token: token,
            status: null,
            result: {}
        }

        try {

            const tokenVerification = jwt.verify(token, secretKey);
            
            authTokenObj.status = true;
            authTokenObj.result = tokenVerification;

        } catch(err) {

            authTokenObj.status = false;
            authTokenObj.result.name = err.name;
            authTokenObj.result.message = err.message;

        }

        return authTokenObj;

    },

    async authRefreshToken(token, secretKey) {

        const userLoginData = {
            authSuccess: false,
            userIdEncryption: false
        }

        console.log('init authRefreshToken method'); 

        const refreshTokenData = this.authToken(token, secretKey);
        console.log('token data:')
        console.log(refreshTokenData);

        if (refreshTokenData.status === true) {

            const userIdObj = refreshTokenData.result.userIdEncryption;
            console.log('userIdObj: ');
            console.log(userIdObj);

            const decryptUserID = await strEncrypter.method.decryptString(userIdObj);
            console.log('decryptUserID: ' + decryptUserID);

            // check that the user exist in db

            const findUser = await dataBaseObj.findUserById(decryptUserID);
            console.log(findUser);

            if (findUser) {

                //console.log('user has been authenticated and still exist in DB');

                userLoginData.authSuccess = true;
                userLoginData.userIdEncryption = await strEncrypter.method.encryptString(decryptUserID);

            } 

        }

        //console.log(userLoginData);
        return userLoginData;

    }


}

module.exports = userTokenObj;