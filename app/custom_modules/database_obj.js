//Packages
const env = require('dotenv').config();
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const {marked} = require("marked");
const createDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);
const strEncrypter = require('./str_encrypter');

//Models
const roleModel = require('../models/role.model');
const UserModel = require('../models/user.model');
const OrderModel = require('../models/order.model');
const ArticleModel = require('../models/article.model');

const dataBaseObj = {

    dbUrl: process.env.DB_URL,

    async initDB() {

        try {
            const connect = await mongoose.connect(this.dbUrl);
            console.log("DataBase Object: Successfully connect to MongoDB.");
            return connect;
        } catch (err) {
            console.error("DataBase Object: Connection error", err);
            throw err;
        }
        

    },

    // methods for user object

    async createUser(usernameParam, emailParam, passwordParam) {

        //regex to test the param validity:
        const validUsernameRegex = /^[a-zA-Z0-9]+$/;
        const securePwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const validEmailRegex = /^[_A-Za-z0-9-]+(?:\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?:\.[A-Za-z]{2,})$/gm;

        const testUsername = validUsernameRegex.test(usernameParam);
        const testPassword = securePwdRegex.test(passwordParam);
        const testEmail = validEmailRegex.test(emailParam);
        //console.log('testEmail: ' + testEmail);

        if(!testUsername) {

            return {creationStatus: false, Error: "username not valid"};

        }

        if (!testPassword) {

            return {creationStatus: false, Error: "password not secure enough"};

        }

        if (!testEmail) {

            return {creationStatus: false, Error: "email format not valid"};

        }

        //console.log("init create user method from databaseObj");

        /*
        console.log(`username: ${usernameParam}`);
        console.log(`email: ${emailParam}`);
        console.log(`password: ${passwordParam}`);
        */

        // Check if username already exist in database
        const usernameInDB = await this.findUserByName(usernameParam);

        // Check if email already exist in database
        const emailInDB = await this.findUserByEmail(emailParam);

        if (usernameInDB.length !== 0) {

            /*
            console.log("username already exist in database");
            console.log(`usernameInDB:`);
            console.log(usernameInDB);
            */

            return {creationStatus: false, Error: "username already used"};

        } else if (emailInDB.length !== 0) {

            /*
            console.log('email already exist in database');
            console.log(`emailInDB:`);
            console.log(emailInDB);
            */

            return {creationStatus: false, Error: "email already used"};

        } else {

            /*
            console.log("username & email doesn't exist in database");
            console.log("we can create new user");
            */

            const userObj = new UserModel({
                username: usernameParam,
                email: emailParam,
                password: passwordParam
            });

            //console.log(userObj);

            try {

                const savedUserObj = await userObj.save();

                //console.log(savedUserObj);

                return {creationStatus: true, userData: savedUserObj};
                
            } catch (err) {
        
                console.log(err);
                //res.json({Error: err});
                return {Error: err};
        
            }

        }

    },

    async findUserById(userId) {

        try {

            const query = UserModel.findById(userId);
            const userFound = await query.exec();
            return userFound;

        } catch (error) {

            console.log(error);
            return false;

        }

    },

    async findUserByName(userName) {

        try {

            const query = UserModel.find({username: userName});
            query.select('username');
            const userFound = await query.exec();
            return userFound;

        } catch (error) {

            console.log(error);
            return false;

        }

    },

    async findUserByEmail(userEmail) {

        const query = UserModel.find({email: userEmail});
        query.select('email');
        const userFound = await query.exec();

        return userFound;

    },

    async getUserCrd(userID) {

        const query = UserModel.findById(userID);
        query.select('_id credit');
        const result = await query.exec();

        return result.credit;

    },

    async getUserCreditBalance(userEncryptedId) {

        const decryptUserId = await strEncrypter.method.decryptString(userEncryptedId);

        try {

            const query = UserModel.findById(decryptUserId);
            query.select('_id credit');
            const result = await query.exec();
            return result.credit;

        } catch(error) {

            console.log(error);
            return false;

        }

    },

    async getUserName(userID) {

        const query = UserModel.findById(userID);
        query.select('_id username');
        const result = await query.exec();

        return result.username;

    },

    async getUserPsw(userID) {

        const query = UserModel.findById(userID);
        query.select('_id password');
        const userPsw = await query.exec();

        return userPsw;

    },

    async getUserStripeId(userID) {

        const query = UserModel.findById(userID);
        query.select('_id stripeCustomerId');
        const result = await query.exec();

        if (result) {

            return result.stripeCustomerId;

        } else {

            return false;

        }

    },

    async updateCreditBalance(userId, creditAmount) {

        console.log("Database Obj: init updateCreditBalance method");

        const user = await this.findUserById(userId);

        /*
        console.log(user);
        console.log(creditAmount);
        */

        const newBalance = user.credit + creditAmount;

        if (!user) {

            throw new NotFoundError();

        } else {

            user.set({ credit: newBalance });
            await user.save();

        }

    },

    // methods for article object

    async createArticle(titleStr, descriptionStr, contentStr, otisUserIdStr, keywordsArr, language) {

        /*
            todo: 
            add process to check and update user credit here
        */

        console.log("Database Obj: init create article method");

        let articleObj = new ArticleModel({
            title: titleStr,
            description: descriptionStr,
            content: contentStr,
            otisUserId: otisUserIdStr,
            language: language,
            keywords: keywordsArr
        });

        try {

            articleObj = await articleObj.save();

            return articleObj

        } catch(err) {

            console.log(err);
            console.log("article value here");
            console.log(articleObj);
            
            return false;

        }

    },

    async deleteArticle(encryptedArticleID, userEncryptedId) {

        // Todo : also check the user ID from the token and make sure it matches with the User ID from the article

        // convertir l'article ID (string que l'on a reçu depuis le vue client) sous un object que l'on peut decrypter
        // Pour le userEncryptedId, celui-ci est déjà récupéré depuis le token, sous la forme d'un object que l'on peut décrypter

        const result = {
            deletionStatus: null,
            encryptedArticleID: encryptedArticleID
        }

        const articleIdObj = {
            iv: encryptedArticleID.split('_')[0],
            encryptedStr: encryptedArticleID.split('_')[1]
        }

        // console.log("articleIdObj:", articleIdObj);

        const decryptArticleId = await strEncrypter.method.decryptString(articleIdObj);
        // console.log('decryptArticleId:', decryptArticleId);

        const decryptUserId = await strEncrypter.method.decryptString(userEncryptedId);
        // console.log("decryptUserId:", decryptUserId);
        // console.log("decryptUserId type:", typeof decryptUserId);

        const articleData = await this.findArticleById(decryptArticleId);
        
        const articleUserIdStr = articleData.otisUserId.toHexString();
        const decryptUserIdStr = decryptUserId.toString();

        /*
        console.log('user ID from article Data:', articleUserIdStr);
        console.log('decryptUserId:', decryptUserIdStr);
        console.log('Comparing:', articleUserIdStr, 'with', decryptUserIdStr);
        */

        // Vérifier que l'user ID contenu dans le token est le même que le user ID dans l'article
        if (articleUserIdStr === decryptUserIdStr) {

            console.log("userID in article valid");

            try {

                await ArticleModel.findByIdAndDelete(decryptArticleId);
                result.deletionStatus = true;
                // console.log(result);

            } catch (err) {

                result.deletionStatus = false;
                result.error = err

            }


        } else {

            result.deletionStatus = false;
            result.error = "userID from article not equal to user ID from token"
            // console.log(result);

        }

        console.log(result);
        return result;

    },

    async findArticleById(articleID) {
        
        //console.log("findArticleById");
        //console.log(articleID);

        try {

            const query = ArticleModel.findById(articleID);
            const articleFound = await query.exec();
            //console.log(articleFound);
            return articleFound;


        } catch(err) {
            console.log(err);
            return false;
        }

    },

    async getArticleIdsList (userIdObj) {

        // console.log('init the getArticleIdsList method from the databaseObj');

        let articleIdsList = null;
        const encryptedArticleIds = [];

        const decryptUserID = await strEncrypter.method.decryptString(userIdObj);
        // console.log('decryptUserID: ' + decryptUserID);

        try {

            const query = ArticleModel.find({otisUserId: decryptUserID}, { _id: 1 });
            articleIdsList = await query.exec();

        } catch (err) {

            console.error(err);
            return false;

        }

        if (articleIdsList) {

            for (let i = 0; i < articleIdsList.length; i++) {

                const encryptedArticleId = await strEncrypter.method.encryptString(articleIdsList[i]._id.toHexString());
                encryptedArticleIds.push(`${encryptedArticleId.iv}_${encryptedArticleId.encryptedStr}`);
        
            }

        }

        // console.log(encryptedArticleIds);

        return encryptedArticleIds;

    },

    async getUserAllArticleDatas (userIdObj) {

        console.log('init the getUserAllArticleDatas method from the databaseObj');

        const articleDataToSend = [];

        const decryptUserID = await strEncrypter.method.decryptString(userIdObj);
        console.log('decryptUserID: ' + decryptUserID);

        try {

            const query = ArticleModel.find({otisUserId: decryptUserID});
            articleList = await query.exec();

            for (let i = 0; i < articleList.length; i++) {

                const encryptedArticleId = await strEncrypter.method.encryptString(articleList[i]._id.toHexString());

                const articleObj = {
                    id: `${encryptedArticleId.iv}_${encryptedArticleId.encryptedStr}`,
                    title: articleList[i].title,
                    description: articleList[i].description,
                    keywordArr: articleList[i].keywords,
                    language: articleList[i].language,
                    content: articleList[i].sanitizedHtml,
                    creationDate: articleList[i].createdAt,
                    lastModifDate: articleList[i].lastModifiedAt,
                  }

                  //console.log(articleObj);

                  articleDataToSend.push(articleObj);

            }

            // console.log('articleDataToSend');
            // console.log(articleDataToSend);

            return articleDataToSend;

        } catch (err) {

            console.error(err);
            return false;

        }

        // console.log('end of the getUserAllArticleDatas method from the databaseObj');

    }

}

module.exports = dataBaseObj;