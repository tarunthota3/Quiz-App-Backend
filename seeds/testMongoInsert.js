var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var questionData =  require("./questions.js")

// console.log(questionData)

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("christmasGame");
    dbo.collection("questionBank").insertMany(array, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });
}

shuffle(questionData);
