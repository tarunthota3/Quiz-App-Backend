const express = require('express')
    , bodyParser = require('body-parser')
    , app = express('app');

/* importing routes */
const questionBank = require('./routes/questionBank.route.js')
    , user = require('./routes/user.route.js');

/* cors */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* static files */
app.use(express.static('./public/'));

/* middlewares */
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

/* routes */
// app.use('/', indexRoute);
app.use('/qb', questionBank);
app.use('/ur', user);

module.exports = app;
