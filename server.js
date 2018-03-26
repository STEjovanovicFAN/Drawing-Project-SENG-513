var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var socketPeople = [];
var totalClients = 0;


app.get('/', function(req, res){
  //res.sendFile(__dirname + '/fabric.js');
  if(totalClients === 0){
    res.sendFile(__dirname + '/drawingMode.html');
    totalClients ++;
  }
  else{
    res.sendFile(__dirname + '/listenClient.html');
    totalClients ++;
  }

});

//check if the user is connected or disconnected
io.on('connection', function(socket){
  console.log("user has connected");

  //when the user disconnects take him off the onlineUser list
  socket.on('disconnect', function(){
    console.log('user disconnected');

  });
  socket.on('push data', function(data){
    io.emit('receive data', data);
    console.log("pushed the dtat to clients");
  });
});

//print message on command prompt to signal that the server is running
http.listen(port, function(){
  console.log('listening on: ' + port);
});
