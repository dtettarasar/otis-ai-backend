const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const cookies = require("cookie-parser");
require('dotenv').config();

const userRouter = require('./routes/user_routes');
const stripePaymentRouter = require('./routes/stripe_api_routes');
const articleRouter = require('./routes/article_routes');
const frontApiRouter = require('./routes/front_api_routes');

const dataBaseObj = require('./app/custom_modules/database_obj');
dataBaseObj.initDB();

const app = express();

// Configurer le moteur de templates EJS
app.set('view engine', 'ejs');

// Configurer les options CORS
const allowedOrigins = process.env.VUE_CLIENT_SERVER;

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Autoriser l'envoi de cookies avec les requêtes CORS
}));

// Gérer les requêtes preflight OPTIONS
app.options('*', cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(cookies(process.env.COOKIE_SIGNATURE_SECRET));

console.log("vue client server:");
console.log(process.env.VUE_CLIENT_SERVER);

// parse requests of content-type - application/json
// necessary condition to avoid using express.json in the stripe_payment route
app.use((req, res, next) => {
    if (req.originalUrl.includes('/user') || req.originalUrl.includes('/front-api')) {
        express.json()(req, res, next);
    } else {
        next();
    }
});

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer les verbes HTTP tels que PUT et DELETE
app.use(methodOverride('_method'));

// routes
app.use('/user', userRouter);
app.use('/payment-api', stripePaymentRouter);
app.use('/article', articleRouter);

app.use('/front-api', (req, res, next) => {
    res.set('Cache-Control', 'no-cache');
    next();
}, frontApiRouter);

// main route
app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/views/index.html');
    res.render('index');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});