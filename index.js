const mailer = require('./services/mailer.js') // mailing service
    , assignSanta = require('./services/assigningSanta.js');

function timer(){
  if(Date.now() >= new Date(2018, 11, 15, 12, 17, 15, 0).getTime()
      && Date.now() <= new Date(2018, 11, 15, 12, 17, 16, 0).getTime()) {
    console.log('dated !');
    assignSanta()
      .then()
      .catch();
  }
}

function main() {
  /* Calling mailing service */
  // mailer()
  //   .then(t => console.log(t))
  //   .catch(err => console.error(err));

  assignSanta().then(t => console.log(t));

}

if(require.main === module) {
  main();
  // setInterval(timer, 1000);
}