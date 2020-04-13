const ur = require('express').Router()
    , MongoClient = require('mongodb').MongoClient
    , url = 'mongodb://localhost:27017'
    , dbName = 'quiz'
    , collectionName = 'users';

function mongoClient() {
    /*
        * Creating connection to Mongo Server
        */
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
        if (err) {
            reject('Error in connecting to DB from santas');
        } else {
            console.info('Successfully connected to Mongo Server from santas');
            resolve(client);
        }
        });
    });
}

const dbCalls = {
    insertUser: function(db, data){
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.insertOne(data,function(err, docs) {
              // console.log("response of fetching particular question: ",docs);
              if (err) {
                reject('error in posting quest - > '+ err);
              } else {
                resolve(JSON.stringify(docs));
              }
            });
        })
    },
    findUser: function(db, data){
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.find(data).toArray(function(err, docs) {
              if (err) {
                reject('error in fetching quest - > '+ err);
              } else {
                resolve(JSON.stringify(docs));
              }
            });
        });
    }
}

ur.post('/user', async function(req, res){
    var client = await mongoClient().catch(err => console.error(err));
    console.log("req.body: ",req.body);
    let data = req.body;
    var db = client.db(dbName);
    dbCalls.insertUser(db,data)
      .then((t) => {
        console.log("response: ",t);
        res.json("User insered successfully");
      })
      .catch((err) => {
        console.error(err);
        res.send('Error in inserting the user');
      });
  });

ur.get('/user', async function(req, res){
var client = await mongoClient().catch(err => console.error(err));
console.log("req.query: ",req.query);
let data = req.query;
var db = client.db(dbName);
dbCalls.findUser(db,data)
    .then((t) => {
    var arr = JSON.parse(t);
    if(arr.length > 0){
      // window.localStorage.setItem("name",arr[0].firstName + " " +arr[0].lastName);
      res.json({
        "fullName": arr[0].firstName + " " + arr[0].lastName,
        "userType": arr[0].userType
      });
    }
    else{
      res.json("User details not found");
    }
    
    })
    .catch((err) => {
    console.error(err);
    res.send('Error in fetching the user details');
    });
});

  module.exports = ur;