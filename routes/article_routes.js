const express = require('express');
const router = express.Router();

const userTokenClass = require('../app/custom_modules/user_token_class');
const userToken = new userTokenClass();

const dataBaseClass = require('../app/config/db.config');
const dataBase = new dataBaseClass();

const aiArticleCreator = require('../app/custom_modules/ai_article_creator');

const dataBaseObj = require('../app/custom_modules/database_obj');

//dataBaseObj.initDB();


router.get("/", userToken.authToken, async (req, res) => {

    const tokenData = {
        Success: true,
        accessToken: req.signedCookies.token,
        refreshToken: req.signedCookies.refreshToken,
        user: req.user
    };

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        credit: await dataBaseObj.getUserCrd(req.user['_id']),
        userArticles: []
    };

    const userArticles = await dataBase.getUserArticles(userInfo.userId);

    if (userArticles.length !== 0) {
        userInfo.userArticles = userArticles;
    }

    /*
    console.log("access to article route");
    console.log(userInfo);
    */

    res.render('article/my-article', userInfo);

});

router.get('/new', userToken.authToken, async (req, res) => {

    /*
        todo : get user credit balance here to check if user has credit, if he/she wants to use the ai feature 
    */

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        credit: await dataBaseObj.getUserCrd(req.user['_id']),
        article: {
            title: "",
            description: "",
            markdown: ""
        }
    };

    console.log("access to new article route");
    console.log(userInfo);

    res.render('article/new-article', userInfo);

});

router.get('/edit/:id', userToken.authToken, async (req, res) => {

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        credit: await dataBaseObj.getUserCrd(req.user['_id']),
        article: await dataBase.findArticleById(req.params.id)
    };

    console.log("access to edit article route");
    console.log(userInfo);

    res.render('article/edit-article',  userInfo);

});

router.get('/:id', userToken.authToken, async (req, res) => {

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id'])
    };

    let articleisOwnbyUser = null;
    console.log(userInfo);

    try {
        userInfo.articleData = await dataBase.findArticleById(req.params.id);

        // make sure the user doesn't access to someone else's article
        articleisOwnbyUser = userInfo.userId.toString() === userInfo.articleData.otisUserId.toString();

        if (articleisOwnbyUser) {

            //res.json(userInfo);
            console.log("access to view article route");
            //console.log(userInfo);
            res.render('article/show', userInfo);


        } else {

            console.log("user tried to access someone else's article");
            res.redirect('/article');

        }

        
    } catch (err) {
        console.log(err);
        res.redirect('/article');
    }

});

router.post('/create', userToken.authToken, async (req, res) => {

    const article = await dataBase.createArticle(req, res);
})

router.post('/create-ai', userToken.authToken, async (req, res) => {

    //const article = await dataBase.createArticle(req, res);

    // todo créer ici fonction pour checker la valeur de req.body.keywords_params
    // S'assurer que c'est convertible en json et que le format respecte bien ce dont on a besoin pour la suite du process
    // un objet avec des des attributs "keyword-tag-int" et en valeur des chaines de caractères, sans caractères spéciaux

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        articleParams: {
            description: req.body.description_param,
            keywords: []
        },
        articleToCreate: {}
    };

    let keywordsParams = {};

    /*
    const articleParams = {
        description: req.body.description,
        keywords: []
    }
    */

    // Créer un block if pour checker si req.body.keywords_params existe. Si on évalue à true, éxécuter le block try catch

    if (req.body.keywords_params) {

        try {

            keywordsParams = JSON.parse(req.body.keywords_params);
    
            for (const keyword in keywordsParams) {
    
                userInfo.articleParams.keywords.push(keywordsParams[keyword]);
        
            }
    
        } catch (err) {
    
            console.log("error when converting keywordsParams from str to json");
            console.log(err);
    
        }

    }

    const parseTextFromMarkDown = (mdString) => {
        return mdString.replace(/[#*]{1,3}\s?|_{1,3}\s?|`{1,3}\s?|(\[(.*?)\]\(.*?\))/g, '');
    }

    const prompt = aiArticleCreator.generatePrompt(userInfo.articleParams.keywords, userInfo.articleParams.description, 'en');
    
    const aiArticleResponse = await aiArticleCreator.generateArticle(prompt);
    /*
    console.log(aiArticleResponse[0].message);
    console.log(typeof aiArticleResponse[0].message.content);
    */

    const articleTitle = aiArticleResponse[0].message.content.split('\n')[0];

    userInfo.articleToCreate.title = parseTextFromMarkDown(articleTitle);
    userInfo.articleToCreate.description = '';
    userInfo.articleToCreate.markdown = aiArticleResponse[0].message.content;

    const createdArticle = await dataBaseObj.createArticle(userInfo.articleToCreate.title, userInfo.articleToCreate.description, userInfo.articleToCreate.markdown, userInfo.userId);

    //console.log(createdArticle);

    if (createdArticle) {

        await dataBaseObj.updateCreditBalance(userInfo.userId, -1);
        
        res.redirect(`/article/${createdArticle['_id']}`);

    } else {

        res.redirect(`/article`);

    }

})

router.put('/update/:id', userToken.authToken, async (req, res) => {

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBase.getUserName(req.user['_id']),
        article: await dataBase.findArticleById(req.params.id) 
    };

    const test = await dataBase.updateArticle(req, res);

    if (test) {

        userInfo.article = await dataBase.findArticleById(req.params.id);
        res.redirect(`/article/${req.params.id}`);

    } else {

        res.json({
            err: "can't update article"
        });

    }


})

router.delete('/:id', async (req, res) => {
    console.log(req.params.id);

    const deleteArticle = dataBase.deleteArticle(req.params.id);

    if (deleteArticle) {
        console.log(`Article (ID: ${req.params.id}) has been deleted`);
    } else {
        console.log(`Error: Article (ID: ${req.params.id}) can't be deleted`);
    }

    res.redirect('/article');
})

module.exports = router;