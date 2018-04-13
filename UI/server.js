var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// Firebase Admin SDK Setup
// const admin = require('firebase-admin');
// const serviceAccount = require('./keys/AdminSDK.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://drawing-project-seng-513.firebaseio.com'
// });

//drawing variables
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
"key", "coin", "hook", "arm", "computer", "lizard", "time", "bee", "slide", "mitten", "rock", "head", "helicopter", "earth"];
var drawUsers = [];
var currentWord = " ";
var countUsers = 0;
var time = 0;
var totalClients = 0;
var currentDrawingID = " ";
var firstGuess = false;

/*
//chat variables
let users = new Array();
let messages = new Array();
let userNum = 0;
let sockets = new Array();
*/

//give client html Page on load
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//give client the css page if client asks for it
app.get('/style.css', function(req, res){
    res.sendFile(__dirname + '/style.css');
});

//give client the chat only if the client asks for it
app.get('/chat.js', function(req, res){
    res.sendFile(__dirname + '/chat.js');
});

//give client the chat only if the client asks for it
app.get('/DrawJS.js', function(req, res){
    res.sendFile(__dirname + '/DrawJS.js');
});

//create a timer for 60 seconds, update clients every second (1000ms)
function startNewTimer(){
		//console.log("i reset the timer");
    time = 60;
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
        if(drawUsers.length === 0){
          //do nothing
        }
        //otherwise continue with program
        else{
          //boradcast to all the rest of the sockets what they are now
          var i = drawUsers[0];
          drawUsers.splice(0, 1);
          drawUsers.push(i);
          //store current drawing user
          currentDrawingID = drawUsers[0].user;

          //emit who the current drawing user is
          var i = drawUsers[0].user;
          io.emit('whosDrawing', i);

					//server that broadcasts whos currently drawing
					var nameOFDrawingUser = drawUsers[0].userName;
					var userColorOfMessage = drawUsers[0].color;
					var serverMsg = " is now drawing!";
					io.emit('serverMessage', nameOFDrawingUser, serverMsg, userColorOfMessage);

					//reset the guess tracking
					for(var j = 0; j < drawUsers.length; j++){
						drawUsers[j].guessedCorrectly = false;
						//console.log(drawUsers[j].guessedCorrectly);
					}
					firstGuess = false;

        }
        startNewTimer();
      }
    }, 1000);
}

//send id of whos drawing
io.on('getWhosDrawing', function (){
  socket.emit('whosDrawing', currentDrawingUser);
});

io.on('connection', function(socket){

    console.log("A new user has connected.");

	var thisUserColor = randColor();
	//create a new user object
  var user1 = {
    "user" : countUsers,
    "socketID" : socket.id,
		"score" : 0,
		"guessedCorrectly" : false,
		"userName" : "tempUser" + countUsers, //for authentication change this
		"color" : thisUserColor
  }
  //give socket its id and name and color
  socket.emit('pushSocketID', countUsers);
	socket.emit('pushSocketName', "tempUser" + countUsers);
	socket.emit('thisUserColor', thisUserColor);

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

	console.log(countUsers);
  //update users and push this new user into our drawing queue
  countUsers++;
  drawUsers.push(user1);

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
/*
	io.emit('updateOnlineList', users);
	io.emit('updateHistory', messages);
	//console.log(sockets.includes(socket.id));
	sockets.push(socket.id);
	//console.log(sockets);

	socket.on('chat message', function(msg){
		msg.time = DisplayCurrentTime();
		messages.push(msg);


		io.emit('chat message1', msg);
		//console.log(msg);
	});

	socket.on('updateUsers', function (userPref) {
		users.push(userPref);
		io.emit('updateOnlineList', users);
	});

	socket.on('updateOnlineList', function () {
		io.emit('updateOnlineList', users);
	});
*/
	socket.on('disconnect', function(){
		/*users = [];
		io.emit('getUsers');
*/
    //get the index and take this user out of the list
    var index = drawUsers.findIndex(x => x.socketID===socket.id);
    drawUsers.splice(index,1);
	});
/*
	//set user
	socket.on('setuser', function (user) {
		userNum++;
		user.name = genName();
		user.color = randColor();
		users.push(user);
		socket.emit('setUser', user);
	});

	//add user
	socket.on('addUser', function (user) {
		user.color = randColor();
		users.push(user);
		socket.emit('setUser', user);
	});

	//UPDATE PREFS HERE
	socket.on('updatePrefs', function (update) {
		//console.log("GOTHERE");
		for(i=0; i < users.length; i++){
			if(users[i]['name'] === update.oldName)
				users[i] = update.userPref;
		}
		io.emit('updateOnlineList', users);
		//console.log(users);
	});*/

	//if server gets data broadcast it to all clients
  socket.on('push data', function(data){
    io.emit('receive data', data);
    //console.log("pushed the data to clients");
  });

	//when the server gets the chat message
	socket.on('chat message', function(message, msgUser, msgColor){
		//split the message by spaces
		var list  = message.split(" ");
		var listWord;

		var getSeversMSG = " ";
		//for each item in this array check if it is the guessed word
		for(var i = 0; i < list.length; i++){
			listWord = list[i];
			var checkVar = pontentialGuess(listWord);
			//check if it returns an empty string, if not that is the message you need to broadcast
			if(checkVar !== " "){
				getSeversMSG = checkVar;
			}

			//if the listword is correct guessed word censor it
			var wordInLowerCase = listWord.toLowerCase();
			if(wordInLowerCase === currentWord){
				//create the length and text of the censored word
				var censorWord ="";
				for(var z = 0; z < currentWord.length; z++){
					censorWord = censorWord + "*";
				}
				list[i] = censorWord;
			}
		}

		//console.log(list);
		//get the current time
		var currTime = DisplayCurrentTime();
		//make the list back into a string
		var joinedString = list.join(" ");

		//send message to be broadcast in the chat
		io.emit('broadcastMessage', joinedString, msgUser, msgColor, currTime);

		//broadcast the server message stating that this user guessed correctly
		if(getSeversMSG !== " "){
			io.emit('serverMessage',msgUser, getSeversMSG, msgColor);
		}
	});

	//guessing for a word
  function pontentialGuess(guess){
		var userGuess = guess.toLowerCase();
		//if the guessed word is correct
		var serverMSG;
    if(userGuess === currentWord){
      //console.log("you guessed correctly");
			var myid = socket.id;
			var index = drawUsers.findIndex(x => x.socketID===socket.id);

			//console.log(drawUsers[index].guessedCorrectly);
			if(drawUsers[index].guessedCorrectly === false){
				//console.log("user guessed correctly");
				if(firstGuess == false){
					//console.log("user hasn't guessed before, update score");
					drawUsers[index].score += 20;
					firstGuess = true;

					//format the server text message
					var getUserName = drawUsers[index].userName;
					serverMSG = " guessed the word correctly! 20 points awarded for being the first to guess the word!";

				}
				else{
					drawUsers[index].score += 10;
					var getUserName = drawUsers[index].userName;
					serverMSG = " guessed the word correctly!";

				}
				drawUsers[index].guessedCorrectly = true;
				console.log(drawUsers[index].score);

				//add points to drawer if another person guessed his shit correctly
				var addPointsToDrawer = drawUsers[0].socketID;
				drawUsers[0].score += 10;
				io.to(addPointsToDrawer).emit('correctGuess', drawUsers[0].score);

				//need to change this emit statement JEFF
				io.to(myid).emit('correctGuess', drawUsers[index].score);


			}
			//if already guessed do nothing but format the serverMSG
			else{
  			serverMSG = " ";
			}

    }
    else{
      //console.log("you guessed wrong");
			serverMSG = " ";
    }

		//return message from sever
		return serverMSG;
  }

});

http.listen(port, function(){
    console.log('The server is listening on: ' + port + ' port.');
});
/*
function genName(){

	let username = "user" + userNum;

	return username;
}*/

function randColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
//function that grabs the current time and formats it
function DisplayCurrentTime() {
	var date = new Date();
	var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	//var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	returnTime = "[" + hours + ":" + minutes + "] "; //":"// + seconds;
	return returnTime;
}
