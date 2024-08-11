const dataBaseObj = require('./database_obj');
const testUserObj = require('./test_user_obj');

let dbConnection;

// Test users

testUserObj.generateUser('user with correct parameters','DummyTestman', 'dummy.testman', '@otis-ai-test.eu', 'Test001!');
testUserObj.generateUser('user with correct parameters','KingPilou', 'king.pilou', '@otis-ai-test.eu', 'Test001!');
testUserObj.generateUser('user with wrong username', 'VivinaDaBest!', 'vivinadabest', '@otis-ai-test.eu', 'Test001!');
testUserObj.generateUser('user with wrong username', 'Lea Kpop', 'lk', '@otis-ai-test.eu', 'Test001!');
testUserObj.generateUser('user with wrong password', 'WilliballZ', 'williballz', '@otis-ai-test.eu', 'dbz');
testUserObj.generateUser('user with wrong password', 'BruceTheSensei', 'bruce', '@otis-ai-test.eu', 'thebestracer63');
testUserObj.generateUser('user with wrong email format', 'DummyTestlady', '!?dummy', '@otis-ai-test.eu', 'Test001!');
testUserObj.generateUser('user with wrong email format', 'DummyTestgirl', 'dummy.testgirl', 'otis-ai-test.eu', 'Test001!');

beforeAll(async () => {

    dbConnection = await dataBaseObj.initDB();

});
  
afterAll(() => {
    dbConnection.disconnect();
});

test('test connexion to MongoDB', async () => {
 
    await expect(dbConnection).toBeDefined();
    await expect(dbConnection.connection.client).toBeDefined();
    await expect(dbConnection.connection.db).toBeDefined();

    await expect(dbConnection.connections[0]['_readyState']).toBe(1);
    await expect(dbConnection.connections[0]['_hasOpened']).toBe(true);

});

test('test user creation', async () => {

    await testUserObj.testUserCreation(0);
    await testUserObj.testUserCreation(1);

    await expect(testUserObj.userCont[0].creationResult.creationStatus).toBe(true);
    await expect(testUserObj.userCont[1].creationResult.creationStatus).toBe(true);

    //console.log(testUserObj.userCont);

});

test('test saved users data', async () => {

    /*
    Test here the username, email and password for the 2 first users.
    Make a comparison between the initial users Object and the object returned by Mongodb after creation. 
    Check that username & email are the same
    Check that the hashed password in MongoDB object match the initial not hashed password. 
    */

});

test('test error handling for user creation: test wrong username', async () => {

    await testUserObj.testUserCreation(2);
    await testUserObj.testUserCreation(3);

    await expect(testUserObj.userCont[2].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[2].creationResult.Error).toBe('username not valid');

    await expect(testUserObj.userCont[3].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[3].creationResult.Error).toBe('username not valid');

    //console.log(testUserObj.userCont);

});

test('test error handling for user creation: test wrong password', async () => {

    await testUserObj.testUserCreation(4);
    await testUserObj.testUserCreation(5);

    await expect(testUserObj.userCont[4].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[4].creationResult.Error).toBe('password not secure enough');

    await expect(testUserObj.userCont[5].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[5].creationResult.Error).toBe('password not secure enough');

    //console.log(testUserObj.userCont);

});

test('test error handling for user creation: test wrong email format', async () => {

    await testUserObj.testUserCreation(6);
    await testUserObj.testUserCreation(7);

    await expect(testUserObj.userCont[6].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[6].creationResult.Error).toBe('email format not valid');

    await expect(testUserObj.userCont[7].creationResult.creationStatus).toBe(false);
    await expect(testUserObj.userCont[7].creationResult.Error).toBe('email format not valid');

    console.log(testUserObj.userCont);

});

test('test error handling for user creation: try to create user that already exist in mongodb', async () => {

    /*
        Take the intial user one & two and try to recreate new users with same email or username. 
        Make sure the database Object return Error object with false creationStatus
    */

});