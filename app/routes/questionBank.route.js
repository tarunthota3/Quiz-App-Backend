const qb = require('express').Router()
    , MongoClient = require('mongodb').MongoClient
    , escape = require('escape-regexp')
    , mongo = require('mongodb')
    , multer = require('multer')
    , csv = require('csvtojson')
    , url = 'mongodb://localhost:27017'
    , dbName = 'christmasGame'
    , collectionName = 'questionBank';

var fileName = '';
var Storage = multer.diskStorage({
   destination: function(req, file, callback) {
     console.log( 'printing dirname: ', __dirname);
      callback(null, __dirname + '\\uploads');
   },
   filename: function(req, file, callback) {
      fileName = file.fieldname + "_" + Date.now() + "_" + file.originalname ;
      console.log('Printing Filename', fileName);
      callback(null, fileName);
   }
});

var upload = multer({ storage: Storage })



var questions = [];


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
  /* inserting santa to the santas collection */
  getQuest: function(db) {
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      collection.find({}).toArray(function(err, docs) {
        if (err) {
          reject('error in fetching quest - > '+ err);
        } else {
          resolve(JSON.stringify(docs));
        }
      });
    });
  },
  deleteQuest: function(db,_id) {
    console.log("inside delete question function: ",_id);
    return new Promise((resolve, reject) => {
      console.log("inside promise of delete function");
      const collection = db.collection(collectionName);
      var questionId = new mongo.ObjectID(_id);
      collection.deleteOne({_id:questionId}, function(err, docs) {
        // console.log("inside delete one callback");
        if (err) {
          reject('error in fetching quest - > '+ err);
        } else {
          console.log("docs:::::: ",docs);
          resolve(JSON.stringify(docs));
        }
      })
    });
  },
  deleteMultipleQuest: function(db,ids) {
    return new Promise((resolve, reject) => {
      let idswithMongoID = [];
      for (let i of ids) {
        idswithMongoID.push(new mongo.ObjectID(i));
      }
      var query = { _id: { $in: idswithMongoID } };
      const collection = db.collection(collectionName);
      collection.deleteMany(query , (err , docs) => {
        if (err) {
          reject('error in deleting quest - > '+ err);
        } else {
          // console.log("docs:::::: ",docs);
          resolve(JSON.stringify(docs));
        }
      	});
    });
  },
  fetchParticularQuestion:function(db, value){
    console.log("value: ",value);
    console.log("value after regex: ",value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "\\$1"));
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      collection.find({question: new RegExp(value, 'i')}).toArray(function(err, docs) {
        console.log("response of fetching particular question: ",docs);
        if (err) {
          reject('error in fetching quest - > '+ err);
        } else {
          resolve(JSON.stringify(docs));
        }
      });
    });
  },
  postQuestion:function(db, data){
    console.log("inside post question");
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
    });
  },
  postBulkQuestion:function(db,data){
    console.log("inside post bulk questions: ",data);
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      collection.insertMany(data,function(err,docs){
        if(err) {
          reject('error in posting quest - > '+ err);
        }
        else{
          resolve(JSON.stringify(docs));
        }
      })
    });
  },
  updateQuestion:function(db,data){
    console.log("inside update question");
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      let id = "5c19dca26dc5a11bd19dd6d1";
      var questionId = new mongo.ObjectID(data.id);
      let requestData = {
        question: data.question,
        op1: data.op1,
        op2: data.op2,
        op3: data.op3,
        op4: data.op4,
        ans: data.ans
      }
      collection.updateOne(
        { _id : questionId },
        { $set: requestData }, function(err, docs) {
              if(err){
                reject('error in updating quest - > '+ err);
              }
              else{
                  resolve(JSON.stringify(docs));
              }
      });
    });
  }
}

// qb.get('/', async function(req, res) {
//   var client = await mongoClient().catch(err => console.error(err));
//   var db = client.db(dbName);
//
//   dbCalls.getQuest(db)
//     .then((t) => {
//       questions = JSON.parse(t);
//       res.json(questions);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.send('Error in fetching santas data');
//     });
// });

qb.get('/allQuestions', async function(req, res) {
  console.log("allQuestions route hit");
  var client = await mongoClient().catch(err => console.error(err));
  var db = client.db(dbName);

  dbCalls.getQuest(db)
    .then((t) => {
      res.json(t);
    })
    .catch((err) => {
      console.error(err);
      res.send('Error in fetching santas data');
    });
});

qb.delete('/question', async function(req, res) {
  console.log("delete question route hit: ",req.query);
  var client = await mongoClient().catch(err => console.error(err));
  var db = client.db(dbName);
  var id = req.query.id
  dbCalls.deleteQuest(db, id)
    .then((t) => {
      console.log("response: ",t);
      res.send("Question Successfully deleted");
    })
    .catch((err) => {
      console.error(err);
      res.send('Error in deleting a question');
    });
});

qb.delete('/questions', async function(req, res) {
  var client = await mongoClient().catch(err => console.error(err));
  var db = client.db(dbName);
  let ids = JSON.parse(req.query.ids);
  dbCalls.deleteMultipleQuest(db, ids)
    .then((t) => {
      console.log("response: ",t);
      res.send("Questions Successfully deleted");
    })
    .catch((err) => {
      console.error(err);
      res.send('Error in deleting a questions');
    });
});



qb.get('/quest',async function(req, res) {
	let q=[];
  console.log("questions length: ",questions.length);
  if(questions.length < 5){
    console.log("length is less than 5");
    var client = await mongoClient().catch(err => console.error(err));
    var db = client.db(dbName);

    dbCalls.getQuest(db)
      .then((t) => {
        // console.log("data received: ",JSON.parse(t));
        // questions.push(JSON.parse(t));
        questions = questions.concat(JSON.parse(t));
        console.log("adding the question set from db");
        console.log("new questions set length: ",questions.length);
        q = questions.slice(0, 5);
        questions.splice(0, 5);
        console.log("spliced array length: ",questions.length);
        console.log("question set: ",q);
        res.json(q);

      })
      .catch((err) => {
        console.error(err);
      });
  }
  else{
    console.log("length is greater than 5");
    q = questions.slice(0, 5);
    questions.splice(0, 5);
    console.log("spliced array length: ",questions.length);
    console.log("question set: ",q);
    res.json(q);
  }
  // q = questions.slice(0,5);


});

  qb.get('/particularQuest',async function(req, res) {
    console.log("query: ",req.query);
    let value = req.query.value;
    var client = await mongoClient().catch(err => console.error(err));
    var db = client.db(dbName);
    dbCalls.fetchParticularQuestion(db,value)
      .then((t) => {
        console.log("response: ",t);
        res.json(t);
      })
      .catch((err) => {
        console.error(err);
        res.send('Error');
      });
  });

  qb.post('/question',async function(req, res) {
    var client = await mongoClient().catch(err => console.error(err));
    console.log("req.body: ",req.body);
    let data = req.body;
    var db = client.db(dbName);
    dbCalls.postQuestion(db,data)
      .then((t) => {
        // console.log("response: ",t);
        res.json("Question insered successfully");
      })
      .catch((err) => {
        console.error(err);
        res.send('Error in inserting the question');
      });
  });
  qb.post('/question/bulkUpload', upload.array('csvFile',1), async function(req, res) {
  // qb.post('/question/bulkUpload', async function(req, res) {
    var client = await mongoClient().catch(err => console.error(err));
    var db = client.db(dbName);
    console.log("__dirname ",__dirname+'\\uploads\\');
    let filePath = __dirname+'\\uploads\\'+fileName
    csv()
    .fromFile(filePath)
    .then((jsonObj)=>{
      dbCalls.postBulkQuestion(db,jsonObj)
        .then((t) => {
          res.json("Questions insered successfully");
        })
        .catch((err) => {
          console.error(err);
          res.send('Error in inserting the questions');
        });
    })
  });


  qb.put('/question',async function(req, res) {
    var client = await mongoClient().catch(err => console.error(err));
    console.log("req.body: ",req.body);
    let data = req.body;
    var db = client.db(dbName);
    dbCalls.updateQuestion(db,data)
      .then((t) => {
        // console.log("response: ",t);
        res.json("Question updated successfully");
      })
      .catch((err) => {
        console.error(err);
        res.send('Error in updating the question');
      });
  });

module.exports = qb;
