var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var drawingWordsDictionary = ["pen", "jar","ocean","worm", "cloud", "fly", "lollipop", "wheel", "apple", "triangle", "diamond", "lemon", "pig", "fire", "ring", "motorcycle", "water", "glasses", "kitten", "octopus", "eye",
"woman", "ears", "cat", "drum", "family", "shirt", "crack", "chimney", "rabbit", "pillow", "square", "oval", "swing", "girl", "bed", "line", "skateboard", "spoon", "kite", "stairs", "cup", "bunny", "snake", "sun",
"spider web", "flower", "milk", "blanket", "jellyfish", "snowman", "candle", "love", "doll", "king", "bear", "dragon", "frog", "bat", "banana", "box", "face", "table", "music", "bird", "book", "whale", "legs",
"orange", "spider", "sunglasses", "button", "blocks", "cupcake", "cow", "lion", "person", "jail", "beak", "butterfly", "ice cream cone", "purse", "ladybug", "bark", "bike", "ant", "house", "bunk bed", "turtle",
"seashell", "monkey", "star", "door", "pie", "socks", "comb", "train", "pizza", "hamburger", "starfish", "heart", "camera", "caterpillar", "dinosaur", "ants", "bracelet", "neck", "car", "nail", "beach", "bleach",
"window", "tree", "horse", "zigzag", "light", "sea", "pants", "alligator", "leaf", "cube", "bounce", "sheep", "hat", "grass", "zoo", "ship", "hand", "snowflake", "smile", "bell", "finger", "rainbow", "fish",
"inchworm", "ball", "rain", "feet", "football", "river", "mouth", "crab", "branch", "balloon", "cheese", "plant", "airplane", "desk", "duck", "bathroom", "circle", "mountain", "chicken", "float", "broom",
"daisy", "pencil", "flag", "carrot", "nose", "cherry", "eyes", "rocket", "ghost", "bread", "baby", "boat", "leg", "sea turtle", "angel", "robot", "bridge", "bus", "backpack", "owl", "crayon", "chair", "snail",
"bowl", "cookie", "feather", "egg", "clock", "swimming pool", "night", "monster", "fork", "hippo", "hair", "bench", "jacket", "candy", "coat", "boy", "tail", "basketball", "popsicle", "bumblebee", "giraffe",
"alive", "bow", "suitcase", "elephant", "dog", "shoe", "moon", "lamp", "mouse", "bone", "curl", "truck", "island", "knee", "zebra", "corn", "man", "grapes", "dream", "bug", "mountains", "lips", "baseball",
"key", "coin", "hook", "arm", "computer", "lizard", "bee", "slide", "mitten", "rock", "head", "Mickey Mouse", "helicopter", "earth"];
var users = [];
var currentWord = " ";
var countUsers = 0;
var time = 0;
var totalClients = 0;
var currentDrawingID = " ";

//render html page on load
app.get('/', function(req, res){
    res.sendFile(__dirname + '/drawingMode.html');
});

//when page asks for DrawJS.js give it to the client
app.get('/DrawJS.js', function(req, res){
    res.sendFile(__dirname + '/DrawJS.js');
});

//create a timer for 60 seconds, update clients every second (1000ms)
function startNewTimer(){
    time = 20;
    //while timer is running, send the current time for this round
    var timer = setInterval(function(){
      if(time >= 0){
        io.emit('send current time', time);
        //console.log(time);
        time --;
      }
      //if the time is < 0, stop the timer and handoff the drawing page to another player
      else{
        clearTimeout(timer);
        //if there are no users connected
        if(users.length === 0){
          //do nothing
        }

        //otherwise continue with program
        else{

          //boradcast to all the rest of the sockets what they are now
          var i = users[0];
          users.splice(0, 1);
          users.push(i);
          //store current drawing user
          currentDrawingID = users[0].user;

          //emit who the current drawing user is
          var i = users[0].user;
          io.emit('whosDrawing', i);
        }
        startNewTimer();
      }
    }, 1000);
}

//send id of whos drawing
io.on('getWhosDrawing', function (){
  socket.emit('whosDrawing', currentDrawingUser);
});


//check if the user is connected or disconnected
io.on('connection', function(socket){
  console.log("user has connected");
  //create a new user object
  var user = {
    "user" : countUsers,
    "socketID" : socket.id
  }
  //give socket its id
  socket.emit('pushSocketID', countUsers);

  //if socket is the first one start timer, give it drawing page
  if(countUsers === 0){
    currentDrawingID = countUsers;
    socket.emit('whosDrawing', currentDrawingID);
    startNewTimer();
  }
  //otherwise give the socket whos currently drawing
  else{
    socket.emit('whosDrawing', currentDrawingID);
  }
  //update users and push this new user into our drawing queue
  //
  countUsers++;
  users.push(user);

  //when the user disconnects take him out of the queue
  socket.on('disconnect', function(){
    console.log('user disconnected');

    //get the index and take this user out of the list
    var index = users.findIndex(x => x.socketID===socket.id);
    users.splice(index,1);

  });

  //if server gets data broadcast it to all clients
  socket.on('push data', function(data){
    io.emit('receive data', data);
    //console.log("pushed the data to clients");
  });

  //guessing for a word
  socket.on('word guess', function(guess){
    var userGuess = guess.toLowerCase();

    if(userGuess === currentWord){
      console.log("you guessed correctly");
    }
    else{
      console.log("you guessed wrong");
    }
  });

  //get a random word and give it to the drawer
  socket.on('getDrawingWord', function(){
    //choose a random word
    var item = drawingWordsDictionary[Math.floor(Math.random()*drawingWordsDictionary.length)];
    currentWord = item.toLowerCase();

    //delete the random word from the dictionary
    var index = drawingWordsDictionary.indexOf(item);
    if(index > -1){
      drawingWordsDictionary.splice(index, 1);
    }

    //give the word to the drawer
    socket.emit('recvWord', item);
  });

});

//print message on command prompt to signal that the server is running
http.listen(port, function(){
  console.log('listening on: ' + port);
});
