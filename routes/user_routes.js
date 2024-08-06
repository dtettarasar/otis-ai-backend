const express = require('express');
const router = express.Router();

const userTokenClass = require('../app/custom_modules/user_token_class');
const userToken = new userTokenClass();

const dataBaseObj = require('../app/custom_modules/database_obj');

router.get('/test', (req, res) => {
    res.send('test user route');
})

router.get('/register', (req, res) => {

    res.render('user/new-user');
});

router.post('/register', async (req, res) => {

    const userObj = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.psw
    } ;

    const userCreation = await dataBaseObj.createUser(userObj.username, userObj.email, userObj.password);

    res.json(userCreation);

});

router.get('/login', (req, res) => {
    res.render('user/login');
});

router.post('/login', userToken.checkUserAuth, userToken.createToken, userToken.createRefreshToken, async (req, res) => {

    return res.redirect("/user/my-account");

});

router.get('/logout', userToken.authToken, userToken.logout, (req, res) => {

    return res.redirect("/");

});

router.post('/refresh-token', userToken.authToken, userToken.authRefreshToken, (req, res) => {

    return res.redirect("/user/my-account");
    
})

router.get('/my-account', userToken.authToken, async (req, res) => {

    const tokenData = {
        Success: true,
        accessToken: req.signedCookies.token,
        refreshToken: req.signedCookies.refreshToken,
        user: req.user
    }

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        credit: await dataBaseObj.getUserCrd(req.user['_id'])
    };

    /*
    TODO: 

    - ne passer dans le token que le userID

    - créer dans db.config.js une fonction qui permet de récup le username et le credit pour la page my account

    - récupérer ici le userID pour faire une requête dans laquelle on va récupérer les données à afficher sur la page à savoir le username et le solde de crédit.

    - dans render, inutile de passer tous les éléments comme les token, ne passer que les infos dont on a besoin pour la view (username + crédit).
    
    */
    
    console.log("access to /my-account route");
    console.log(userInfo);

    res.render('user/user-account', userInfo);
    
})

router.get('/add-credits', userToken.authToken, async (req, res) => {

    const tokenData = {
        Success: true,
        accessToken: req.signedCookies.token,
        refreshToken: req.signedCookies.refreshToken,
        user: req.user
    }

    const userInfo = {
        userId: req.user['_id'],
        username: await dataBaseObj.getUserName(req.user['_id']),
        credit: await dataBaseObj.getUserCrd(req.user['_id'])
    };

    console.log("access to /add-credits");
    console.log(userInfo);

    res.render('user/add-credits', userInfo);

})

module.exports = router;