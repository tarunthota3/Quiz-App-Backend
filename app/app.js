const express = require('express')
    , bodyParser = require('body-parser')
    , app = express('app');

/* importing routes */
const santas = require('./routes/santas.route.js')
    , questionBank = require('./routes/questionBank.route.js');

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
app.use('/santas', santas);
app.use('/qb', questionBank);

module.exports = app;
