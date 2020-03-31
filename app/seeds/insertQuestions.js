var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var questionData =  require("./questions.js")

console.log("questionData: ",questionData.slice(40,44));


MongoClient.connect(url, function(err, db) {
    let category_name = "entertainment";
    if (err) throw err;
    var dbo = db.db("christmasGame");
    dbo.collection("category").update(
            {
                name: category_name
            },
            {
                $push: {
                    data: {$each: questionData.slice(0,13)
                }
            }
        }, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });