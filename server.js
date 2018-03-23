var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/fabric.js');
  res.sendFile(__dirname + '/drawingMode.html');
});

//check if the user is connected or disconnected
io.on('connection', function(socket){
  console.log("user has connected");

  //when the user disconnects take him off the onlineUser list
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

//print message on command prompt to signal that the server is running
http.listen(port, function(){
  console.log('listening on: ' + port);
});
