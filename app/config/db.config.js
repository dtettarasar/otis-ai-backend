//Packages
const env = require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const {marked} = require("marked");
const createDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

//Models
const roleModel = require('../models/role.model');
const UserModel = require('../models/user.model');
const OrderModel = require('../models/order.model');
const ArticleModel = require('../models/article.model');
//const Article = require('../models/article.model');

class DataBase {

    constructor () {

        this.dbUrl = process.env.DB_URL;

    }

    async initDB() {

        try {
            const connect = await mongoose.connect(this.dbUrl);
            console.log("Successfully connect to MongoDB.");
        } catch (err) {
            console.error("Connection error", err);
            process.exit();
        }
        

    }

    async createUser(req, res) {

        const userObj = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.psw
        });

        // Check if username already exist in database
        const usernameInDB = await this.findUserByName(userObj.username);

        // Check if email already exist in database
        const emailInDB = await this.findUserByEmail(userObj.email);

        if (usernameInDB.length !== 0) {

            console.log("username already exist in database");
            console.log(usernameInDB);

            res.json({Error: "username already used"});

        }   else if (emailInDB.length !== 0) {

            console.log('email already exist in database');
            console.log(emailInDB);

            res.json({Error: "email already used"});

        } else {
            
            console.log("username & email doesn't exist in database");

            try {

                const user = await userObj.save();
                console.log(user);
                res.json(user);
                
            } catch (err) {
        
                console.log(err);
                res.json({Error: err});
        
            }

        }

    }

    async createOrder(webhookOrderObj) {

        console.log('init createOrder func');

        //get the order object generated from the webhook post route and save it in MongoDB
        const orderObjToSave = new OrderModel(webhookOrderObj);

        let orderSaved = null;

        try {

            orderSaved = await orderObjToSave.save();
            console.log("orderSaved:")
            console.log(orderSaved);

        } catch (err) {

            console.log(err);
            res.json({Error: err});
        }

        console.log('--------------------');

        return orderSaved;

    }

    async createArticle(req, res) {
        
        console.log("init create article method");

        let articleObj = new ArticleModel({
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
            otisUserId: req.user['_id']
        });

        /*console.log('article Obj');
        console.log(articleObj);*/

        try {

            articleObj = await articleObj.save();

            res.redirect(`${articleObj.id}`);

        } catch(err) {

            console.log(err);
            console.log("article value here");
            console.log(articleObj);
            res.render('article/new-article');

        }

    }

    async updateArticle(req, res) {
        
        console.log("init update article method");

        let articleObj = {
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
            lastModifiedAt: Date.now()
        }

        let articleFilter = {
            _id: req.params.id
        }

        if (articleObj.markdown) {

            const markdownToHtml = marked(articleObj.markdown);
    
            articleObj.sanitizedHtml = dompurify.sanitize(markdownToHtml);
    
        }

        try {

            let articleToUpdate = await ArticleModel.findOneAndUpdate(articleFilter, articleObj);
            return true;

        } catch(err) {

            console.log(err);
            return false;

        }

    }

    async createStripeCustomerObj(userID) {

        /*

            Pour éviter de créer plusieurs objets customer dans la base de Stripe à chaque fois qu'un utilisateur achète des crédits: 
            - ajouter un attribut stripe customer id, sur l'objet user, initié à null
            - lors d'un achat de crédit : vérifier si l'utilisateur à un id customer stripe. Si oui, on passe cet id existant dans la cheskout session creation.
            - Sinon on crée un customer Stripe pour l'utilisateur, puis sauvegarder l'id customer dans l'objet user

        */

        console.log("init createStripeCustomerObj method----------------");

        let customer = {};

        const stripeCustomerId = await this.getUserStripeId(userID);

        console.log("stripeCustomerId: " + stripeCustomerId);

        if (stripeCustomerId) {

            try {

                customer = await stripe.customers.retrieve(stripeCustomerId);
                console.log(customer);

            } catch (error) {

                console.log("error in createStripeCustomerObj method:");
                console.log(error);

            }

        }

        if (customer.deleted === true || !stripeCustomerId) {

            console.log("Stripe customer has been deleted or not created yet");

            // Identifier le user pour lequel créer ou mettre à jour le stripe customer id
            let userToUpdate = await this.findUserById(userID);
            // console.log("user found");
            // console.log(userToUpdate); 

            // Créer un nouveau stripe customer 
            customer = await stripe.customers.create({
                email: userToUpdate.email,
                metadata: {
                    description: 'Otis Customer',
                    otisUserId: userID,
                    username: userToUpdate.username
                },
                name: `otis_ai_${userToUpdate.username}_${userID}` 
            });

            if (!userToUpdate) {
                throw new NotFoundError();
            } else {
                userToUpdate.set({ stripeCustomerId: customer.id });
                await userToUpdate.save();
            }

        }
        
        console.log("end of createStripeCustomerObj method----------------");

        return customer;


    }

    async deleteArticle(articleID) {
        
        try {

            await ArticleModel.findByIdAndDelete(articleID);
            return true;

        } catch(err) {

            console.log(err);
            return false;

        }

    }

    async findUserByName(userName) {

        const query = UserModel.find({username: userName});
        query.select('username');
        const userFound = await query.exec();

        return userFound;

    }

    async findUserByEmail(userEmail) {

        const query = UserModel.find({email: userEmail});
        query.select('email');
        const userFound = await query.exec();

        return userFound;

    }

    async findUserById(userID) {

        const query = UserModel.findById(userID);
        const userFound = await query.exec();

        return userFound;

    }

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

    }

    async findArticleBySlug(slugValue) {

        try {

            const query = ArticleModel.findOne({slug: slugValue});
            const articleFound = await query.exec();
            //console.log(articleFound);
            return articleFound;


        } catch(err) {
            console.log(err);
            return false;
        }

    }

    async getUserPsw(userID) {

        const query = UserModel.findById(userID);
        query.select('_id password');
        const userPsw = await query.exec();

        return userPsw;

    }

    async getUserCrd(userID) {

        const query = UserModel.findById(userID);
        query.select('_id credit');
        const result = await query.exec();

        return result.credit;

    }

    async getUserStripeId(userID) {

        const query = UserModel.findById(userID);
        query.select('_id stripeCustomerId');
        const result = await query.exec();

        return result.stripeCustomerId;

    }

    async getUserName(userID) {

        const query = UserModel.findById(userID);
        query.select('_id username');
        const result = await query.exec();

        return result.username;

    }

    async getUserArticles(userID) {

        const userFound = await this.findUserById(userID);

        if (userFound) {

            let filter = {
                otisUserId: userID
            }

            const query = ArticleModel.find(filter).sort({createdAt: 'desc'});

            const result = await query.exec();

            if (result) {
                return result;
            }

        }

        return false;

    }

    async addCreditToUser(userID, creditToAdd) {

        console.log('init addCreditToUser func');

        let userToUpdate = await this.findUserById(userID);
        console.log("user found");
        console.log(userToUpdate);
        const newBalance = userToUpdate.credit + creditToAdd;

        if (!userToUpdate) {
            throw new NotFoundError();
        } else {
            userToUpdate.set({ credit: newBalance });
            await userToUpdate.save();
        }

        console.log('--------------------');

    }

}

module.exports = DataBase;
