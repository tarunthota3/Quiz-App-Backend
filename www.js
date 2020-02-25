const http = require('http')
    , app = require('./app/app.js')
    , server = http.createServer(app)
    , PORT = process.env.PORT || 5005;

// promises to listen server
function startServer() {
  return new Promise((resolve, reject) => {
    server.listen(PORT, (err, res) => {
      if (err) {
        reject("Error in starting server " + err);
      } else {
        resolve("Server is started in " + PORT);
      }
    });
  });
}

if(require.main === module) {
  startServer()
    .then(t => console.log(t))
    .catch(err => console.error(err));
} else {
  exports.server = server;
}