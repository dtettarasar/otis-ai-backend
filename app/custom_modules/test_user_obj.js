// Module used to generate users for unit testing
const dataBaseObj = require('./database_obj');

const testUserObj = {

    getRandomInt: function (max) {

        return Math.floor(Math.random() * max);

    },

    generateUser: function(comment, userNameStr, emailNameStr, emailDomainStr, passwordStr) {

        const int = this.getRandomInt(10000);

        const testUserObj = {
            id: this.userCont.length,
            comment: comment,
            username: `${userNameStr}${int}`,
            email: `${emailNameStr}${int}${emailDomainStr}`,
            password: `${passwordStr}`,
            creationResult: null,
            authResult: null,
            tokenResult: null,
            authTokenResult: null,
            refreshTokenResult: null,
            authRefreshTokenResult: null
        }

        this.userCont.push(testUserObj);

    },
    
    testUserCreation: async function(testUserId) {

        const test = await dataBaseObj.createUser(this.userCont[testUserId].username, this.userCont[testUserId].email, this.userCont[testUserId].password);

        this.userCont[testUserId].creationResult = test;

    },

    userCont: []

}

module.exports = testUserObj;