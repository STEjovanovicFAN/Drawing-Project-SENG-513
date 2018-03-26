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
var totalClients = 0;
var currentWord = " ";


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
    //totalClients--;

  });

  //if server gets data broadcast it to all clients
  socket.on('push data', function(data){
    io.emit('receive data', data);
    console.log("pushed the dtat to clients");
  });

  socket.on('word guess', function(guess){
    var userGuess = guess.toLowerCase();

    if(userGuess === currentWord){
      console.log("you guessed coredasdjdska");
    }
    else{
      console.log("you fucked up phaggot");
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
