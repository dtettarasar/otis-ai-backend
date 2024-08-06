const env = require('dotenv').config({ path: '../.env' });
const strHasher = require('./str_hasher');
const jwt = require("jsonwebtoken");

const dataBaseClass = require('../config/db.config');
const dataBase = new dataBaseClass();

class UserToken {

    async checkUserAuth (req, res, next) {

        
        // Data filled by the user on the login form
        const userObj = {
            username: req.body.username,
            password: req.body.psw
        };
        

        const usernameInDB = await dataBase.findUserByName(userObj.username);

        if (usernameInDB.length === 0) {

            console.log('Error: invalid username')
            res.json({Error: "invalid login"});
            return false;
            
        } else {

            const userToCheckAuth = usernameInDB[0];

            const hashObj = await dataBase.getUserPsw(userToCheckAuth._id);

            const checkHash = await strHasher.method.checkHash(userObj.password, hashObj.password);

            if (!checkHash) {

                console.log('Error: invalid password');
                res.json({Error: "invalid login"});
                return false;

            }

            res.locals.userData = usernameInDB[0];
            next();

        }

    }

    async createToken (req, res, next) {

        //Get the user for which we create the token

        // Data filled by the user on the login form
        const user = res.locals.userData;

        if (user) {

            const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});

            res.cookie("token", accessToken, {
                httpOnly: true,
                secure: true,
                signed: true,
                sameSite: 'strict'
            });

            next();

        } else {

            res.json({Error: "create token error"});
            return false;

        }
    }

    async createRefreshToken (req, res, next) {

        //Get the user for which we create the token

        // Data filled by the user on the login form
        const user = res.locals.userData;

        if (user) {

            const refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, {expiresIn: '4h'});

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                signed: true,
                sameSite: 'strict'
            });

            next();

        } else {

            res.json({Error: "create refresh token error"});
            return false;

        }
    }

    authToken(req, res, next) {

        const token = req.signedCookies.token;
    
        try {
    
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = user;
            next();
    
        } catch (err) {
    
            res.clearCookie("token");
            return res.redirect("/user/login");
            
        }
    
    }

    logout(req, res, next) {

        try {

            res.clearCookie("token");
            res.clearCookie("refreshToken");

            next();

        } catch (errMsg) {

            res.json({
                error: errMsg
            })

        }

    }

    async authRefreshToken(req, res, next) {

        const refreshToken = req.signedCookies.refreshToken;

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {

            if (err) {

                return res.sendStatus(401);
                
            } else {

                console.log('user in refresh token');

                delete user.iat;
                delete user.exp;

                console.log(user);

                const checkUserID = await dataBase.findUserById(user['_id']);

                console.log(checkUserID);

                if (checkUserID) {

                    const newAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '25m'});

                    res.cookie("token", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        signed: true,
                        sameSite: 'strict'
                    });

                }

                next();
            }

        });
    
    }

} 

module.exports = UserToken;