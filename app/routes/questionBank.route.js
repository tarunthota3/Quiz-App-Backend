const qb = require('express').Router()
    , MongoClient = require('mongodb').MongoClient
    , escape = require('escape-regexp')
    , mongo = require('mongodb')
    , multer = require('multer')
    , csv = require('csvtojson')
    , url = 'mongodb://localhost:27017'
    , dbName = 'quiz'
    , collectionName = 'category';

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
  getQuest: function(db, categoryName) {
    console.log("category name: ",categoryName);
    
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      collection.find({name:categoryName}).toArray(function(err, docs) {
        if (err) {
          reject('error in fetching quest - > '+ err);
        } else {
          
          let questionId = docs[0].questionId;
          let data = docs[0].data;
          console.log("question size: ", data.length);
          
          // resolve(JSON.stringify(data.slice(0,4)));
          let noOfQuestions = 5;
          let temp = questionId + 4;
          let updatedQuestionId = 0;
          let arr = [];
          if(temp == data.length - 1){
            arr = data.slice(questionId, temp + 1);
            updatedQuestionId = 0;
          }
          else if(temp < data.length - 1){
            arr = data.slice(questionId, temp + 1)
            updatedQuestionId = temp + 1;
          }
          else if(temp > data.length - 1){
            
            let lastNumberOfElements = data.length - questionId;
            console.log("lastNumberofElements: ", lastNumberOfElements);
            
            let firstNumberOfElements = noOfQuestions - lastNumberOfElements;
            console.log("firstNumberOfElements: ", firstNumberOfElements);
            
            let lastElements = data.slice(questionId, (questionId + lastNumberOfElements));
            
            // console.log("lastElements: ", lastElements);
            
            let firstElements = data.slice(0, firstNumberOfElements);

            // console.log("firstElements: ", firstElements);
            
            arr = lastElements.concat(firstElements);
            updatedQuestionId = firstNumberOfElements;
          }
          
          collection.updateOne(
              { name : categoryName },
              { $set: { questionId : updatedQuestionId } }, function(err, result) {
                if(err){
                  reject('error in fetching quest - > '+ err);
                }
                else{
                  console.log("array: ", arr);
                  console.log("questionid which needs to be updated: ", updatedQuestionId); 
                  resolve(JSON.stringify(arr));
                }
          });

          
        }
      });
    });
  },
  getAllQuest: function(db) {
    return new Promise((resolve, reject) => {
      console.log("inside promise of delete function");
      const collection = db.collection(collectionName);
      collection.find().toArray(function(err, docs) {
        // console.log("inside delete one callback");
        if (err) {
          reject('error in fetching quest - > '+ err);
        } else {
          // console.log("docs:::::: ",docs);
          resolve(JSON.stringify(docs));
        }
      })
    });
  },
  deleteQuest: function(db,category, key) {
    return new Promise((resolve, reject) => {
      // console.log("inside promise of delete function");
      const collection = db.collection(collectionName);
      collection.find({name:category}).toArray(function(err, docs) {
        // console.log("docs: ", docs);
        let questions = docs[0].data;
        questions.splice(key, 1);
        collection.updateOne(
          { name : category },
          { $set: { data: questions } }, function(err, docs) {
            if(err){
              reject('error in fetching quest - > '+ err);
            }
            else{
              resolve(JSON.stringify(docs));
            }
      });
      });
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
      let questionData = {
        question : data.question,
        image_url : data.image_url,
        audio_url : data.audio_url,
        op1 : data.op1,
        op2 : data.op2,
        op3 : data.op3,
        op4 : data.op4,
        ans : data.ans
      };
      collection.updateOne(
        {
            name: data.category
        },
        {
            $push: {
                data: questionData
            }
        }, function(err, docs) {
          if (err) {
            reject('error in fetching quest - > '+ err);
          } else {
            resolve(JSON.stringify(docs));
          }
      });
    });
  },
  postBulkQuestion:function(db,data, category){
    console.log("inside post bulk questions: ",data, category);
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      collection.updateOne(
        {
            name: category
        },
        {
            $push: {
                data: {
                  $each: data
                }
            }
        }, function(err, docs) {
          if(err){
            console.log("err: ", err);
            
            reject('error in updating quest - > '+ err);
          }
          else{
              console.log("before resolve: ", docs);
              
              resolve(JSON.stringify(docs));
          }
      });
    });
  },
  updateQuestion:function(db,data){
    console.log("inside update question");
    return new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);
      let category = data.category;
      let key = data.key;
      let requestData = {
        question: data.question,
        op1: data.op1,
        op2: data.op2,
        op3: data.op3,
        op4: data.op4,
        ans: data.ans
      }

      // db.category.update( {name:"entertainment"}, {$set:{"data.0.question":"TEST?"}});
      collection.updateOne(
        { name : category },
        { $set: {
          [`data.${key}.question`]: requestData.question,
          [`data.${key}.op1`]:requestData.op1,
          [`data.${key}.op2`]:requestData.op2,
          [`data.${key}.op3`]:requestData.op3,
          [`data.${key}.op4`]:requestData.op4,
          [`data.${key}.ans`]:requestData.ans,
        } }, function(err, docs) {
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

  dbCalls.getAllQuest(db)
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
  var category = req.query.category;
  var key = req.query.key;
  dbCalls.deleteQuest(db, category, key)
    .then((t) => {
      // console.log("response: ",t);
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
  let categoryName = req.query.categoryName;
    var client = await mongoClient().catch(err => console.error(err));
    var db = client.db(dbName);

    dbCalls.getQuest(db, categoryName)
      .then((t) => {
        console.log("data received: ",JSON.parse(t));
        res.json(JSON.parse(t));

      })
      .catch((err) => {
        console.error(err);
      });
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
    let category = req.body.categoryData;
    
    var client = await mongoClient().catch(err => console.error(err));
    var db = client.db(dbName);
    console.log("__dirname ",__dirname+'\\uploads\\');
    let filePath = __dirname+'\\uploads\\'+fileName
    csv()
    .fromFile(filePath)
    .then((jsonObj)=>{
      dbCalls.postBulkQuestion(db,jsonObj, category)
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
