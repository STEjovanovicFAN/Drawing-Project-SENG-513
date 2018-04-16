/* Dependencies */
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const admin = require('firebase-admin');
const serviceAccount = require('./keys/firebase-key.json');

// Firebase Admin SDK Setup
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://drawing-project-seng-513.firebaseio.com'
});

http.listen(port, function() {
    console.log('The server is listening on: ' + port + ' port.');
});

/* Variables */

// reference to the Firebase Database
const db = admin.database();

//drawing variables

let drawingWords = ["pen", "jar","ocean","worm", "cloud", "fly", "lollipop", "wheel", "apple", "triangle", "diamond", "lemon", "pig", "fire", "ring", "motorcycle", "water", "glasses", "kitten", "octopus", "eye",
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

let tempDrawingWords = ["pen", "jar","ocean","worm", "cloud", "fly", "lollipop", "wheel", "apple", "triangle", "diamond", "lemon", "pig", "fire", "ring", "motorcycle", "water", "glasses", "kitten", "octopus", "eye",
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
let drawUsers = [];
let scoreBoardUsers = [];
let currentWord = " ";
let countUsers = 0;
let time = 0;
let currentDrawingID = " ";
let firstGuess = false;

/* Routing */

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//create a timer for 60 seconds, update clients every second (1000ms)
function startNewTimer() {
    //console.log("i reset the timer");
    time = 15;
    //while timer is running, send the current time for this round
    let timer = setInterval(function() {
        if (time >= 0) {
            io.emit('send current time', time);
            time--;
        } else {
            // if the time is < 0, stop the timer and handoff the drawing page to another player
            clearTimeout(timer);
            // if there are no users connected
            if (drawUsers.length === 0) {
                // do nothing
            } else {
                // otherwise continue with program
                // boradcast to all the rest of the sockets what they are now
                let i = drawUsers[0];
                drawUsers.splice(0, 1);
                drawUsers.push(i);
                //store current drawing user
                currentDrawingID = drawUsers[0].user;

                // emit who the current drawing user is
                let index = drawUsers[0].user;
                io.emit('whosDrawing', index);

                //server that broadcasts whos currently drawing
                let nameOfDrawingUser = drawUsers[0].userName;
                let userColorOfMessage = drawUsers[0].color;
                let serverMsg = " is now drawing!";
                io.emit('serverMessage', nameOfDrawingUser, serverMsg, userColorOfMessage);

                //reset the guess tracking
                for (let j = 0; j < drawUsers.length; j++) {
                    drawUsers[j].guessedCorrectly = false;
                }
                firstGuess = false;
            }
            startNewTimer();
        }
    }, 1000);
}

/* Socket */

// send id of whos drawing
io.on('getWhosDrawing', function (socket) {
    socket.emit('whosDrawing', currentDrawingUser);
});

io.on('connection', function(socket) {
    console.log("A new user has connected.");

    let thisUserColor = randColor();
	//create a new user object
    let user1 = {
        "user": countUsers,
        "socketID": socket.id,
		"score": 0,
		"guessedCorrectly": false,
		"userName": "tempUser" + countUsers, //for authentication change this
		"color": thisUserColor
    };

    //give socket its id and name and color
    socket.emit('pushSocketID', countUsers);
	socket.emit('pushSocketName', "tempUser" + countUsers);
	socket.emit('thisUserColor', thisUserColor);

	//if socket is the first one start timer, give it drawing page
    if (countUsers === 0) {
        currentDrawingID = countUsers;
        socket.emit('whosDrawing', currentDrawingID);
        startNewTimer();
    } else {
        // otherwise give the socket whos currently drawinelse
        socket.emit('whosDrawing', currentDrawingID);
    }

    console.log(countUsers);
    // update users and push this new user into our drawing queue
    countUsers++;
    drawUsers.push(user1);
    // put user into our score board too and update clients about the score board
    scoreBoardUsers.push(user1);
    io.emit('updateScoreBoard', scoreBoardUsers);
    socket.on('getDrawingWord', function() {
        // choose a random word
        let item = tempDrawingWords[Math.floor(Math.random() * tempDrawingWords.length)];

        if (item == undefined) {
            tempDrawingWords = drawingWords;
            item = tempDrawingWords[Math.floor(Math.random() * tempDrawingWords.length)];
        }

        currentWord = item.toLowerCase();
        // delete the random word from the dictionary
        let index = tempDrawingWords.indexOf(item);

        if (index > -1) {
            tempDrawingWords.splice(index, 1);
        }
        // give the word to the drawer
        socket.emit('recvWord', item);
    });

    socket.on('saveCanvas', function(obj) {
        admin.auth().verifyIdToken(obj.token)
            .then(function(decodedToken) {
                let uid = decodedToken.uid;
                // append image to an array of image for a user

                writeImageToDB(uid, obj.image, socket.id);
            }).catch(function(error) {
              console.log(error.message);
            let errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode && errorMessage) {
                console.log(errorCode);
                console.log(errorMessage);
            }
            });
	});

	socket.on('readCanvas', function(obj) {
        console.log("in read canvas");
        admin.auth().verifyIdToken(obj.token)
            .then(function(decodedToken) {
                let uid = decodedToken.uid;
                readImageFromDB(uid, obj.index, socket.id);
            }).catch(function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode && errorMessage) {
                console.log(errorCode);
                console.log(errorMessage);
            }
        });
    });

    socket.on('nickname', function(obj) {
        console.log('in nickname');
        admin.auth().verifyIdToken(obj.token)
            .then(function(decodedToken) {
                let uid = decodedToken.uid;
                let nickname = obj.nickname;
                writeNicknameToDB(uid, nickname, socket.id);
            }).catch(function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode && errorMessage) {
                console.log(errorCode);
                console.log(errorMessage);
            }
        });
    });

    // if a user asks to be disconnected from the game, disconnect them from the game
    socket.on('removeMeFromGameState', function() {
        // find the index where it is in queue
        let index = drawUsers.findIndex(x => x.socketID===socket.id);
        let storeQue = drawUsers[index];
        // take it out of queue
        drawUsers.splice(index, 1);

        // find the index of this user in the scoreboard
        index = scoreBoardUsers.findIndex(x => x.socketID===socket.id);
        let storeScore = scoreBoardUsers[index];
        // take it out of the scoreboard
        scoreBoardUsers.splice(index,1);
        //u pdate the scoreboard
        io.emit('updateScoreBoard', scoreBoardUsers);
        // now confirm this with the client that asked to be removed from the game
        socket.emit('confirmRemove', storeQue, storeScore);
    });

    // when the client asks to reconnect back to game add him to the queue and scoreboard
    socket.on('reconnectToGame', function(queueInfo, scoreInfo) {
        drawUsers.push(queueInfo);
        scoreBoardUsers.push(scoreInfo);
        io.emit('updateScoreBoard', scoreBoardUsers);
    });

    //when client is authenticated(logged on) and requests a name change
    socket.on('changeNickName', function(newNameOfClient){
      console.log("inside of change nick name");
      //find the client in drawUsers and scoreBoardUsers and change its name, after update the scoreBoard
      let index = drawUsers.findIndex(x => x.socketID === socket.id);
      drawUsers[index].userName = newNameOfClient;

      index = scoreBoardUsers.findIndex( x => x.socketID === socket.id);
      scoreBoardUsers[index].userName = newNameOfClient;

      console.log(scoreBoardUsers);
      //update scoreBoard
      io.emit('updateScoreBoard', scoreBoardUsers);
    });

	socket.on('disconnect', function() {
        // get the index and take this user out of the queue
        let index = drawUsers.findIndex(x => x.socketID === socket.id);
        drawUsers.splice(index, 1);

        // get the index and take the user out of the scoreboard
        index = scoreBoardUsers.findIndex( x => x.socketID === socket.id);
        scoreBoardUsers.splice(index,1);
        // update scoreboard
        io.emit('updateScoreBoard', scoreBoardUsers);
	});

	// if server gets data broadcast it to all clients
    socket.on('push data', function(data) {
        io.emit('receive data', data);
    });

    //when the server gets the chat message
    socket.on('chat message', function(message, msgUser, msgColor){
        // split the message by spaces
        let list  = message.split(" ");
        let listWord;
        let getSeversMSG = " ";

        // for each item in this array check if it is the guessed word
		for (let i = 0; i < list.length; i++) {
			listWord = list[i];
            let checkVar = pontentialGuess(listWord);
			// check if it returns an empty string, if not that is the message you need to broadcast
			if (checkVar !== " ") {
				getSeversMSG = checkVar;
			}

			// if the listword is correct guessed word censor it
            let wordInLowerCase = listWord.toLowerCase();
			if (wordInLowerCase === currentWord) {
				//create the length and text of the censored word
                let censorWord ="";
				for(let z = 0; z < currentWord.length; z++){
					censorWord = censorWord + "*";
				}
				list[i] = censorWord;
			}
		}

		// get the current time
        let currTime = DisplayCurrentTime();
		// make the list back into a string
        let joinedString = list.join(" ");

		// send message to be broadcast in the chat
		io.emit('broadcastMessage', joinedString, msgUser, msgColor, currTime);

		// broadcast the server message stating that this user guessed correctly
		if(getSeversMSG !== " ") {
			io.emit('serverMessage',msgUser, getSeversMSG, msgColor);
		}
	});

    // guessing for a word
    function pontentialGuess(guess) {
        let userGuess = guess.toLowerCase();
		// if the guessed word is correct
        let serverMSG;

		if (userGuess === currentWord) {
            let myid = socket.id;
			// index for queue
            let index = drawUsers.findIndex(x => x.socketID === socket.id);

			// console.log(drawUsers[index].guessedCorrectly);
			if (drawUsers[index].guessedCorrectly === false) {
			    //console.log("user guessed correctly");
                if (!firstGuess) {
                    // console.log("user hasn't guessed before, update score");
					drawUsers[index].score += 20;
					firstGuess = true;

					// format the server text message
                    let getUserName = drawUsers[index].userName;
					serverMSG = getUserName + ' guessed the word correctly! 20 points awarded for being the first to guess the word!';
				} else {
                    drawUsers[index].score += 10;
                    let getUserName = drawUsers[index].userName;
					serverMSG = getUserName + ' guessed the word correctly!';
				}
				drawUsers[index].guessedCorrectly = true;

				// add points to drawer if another person guessed his shit correctly
                let addPointsToDrawer = drawUsers[0].socketID;
				drawUsers[0].score += 10;

				// update for the scoreboard

                // find the current drawing id
                for (let k = 0 ; k < scoreBoardUsers.length; k++){
                    //check if its the current drawing user
                    if(scoreBoardUsers[k].id === currentDrawingID) {
                        scoreBoardUsers[k].score += 10;
                    }
                }

                io.to(addPointsToDrawer).emit('correctGuess', drawUsers[0].score);

                // need to change this emit statement JEFF
				io.to(myid).emit('correctGuess', drawUsers[index].score);
				// broadcast the user score list
                io.emit('updateScoreBoard', scoreBoardUsers);
			} else {
                // if already guessed do nothing but format the serverMSG
                serverMSG = " ";
			}
		} else {
			serverMSG = " ";
		}

		// return message from sever
		return serverMSG;
    }
});

// generates a random color.
function randColor() {
	let letters = '0123456789ABCDEF';
    let color = '#';
	for (let i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

// grabs the current time and formats it.
function DisplayCurrentTime() {
	let date = new Date();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let returnValue = "[" + hours + ":" + minutes + "] ";
	return returnValue;
}

/*
Firebase Database
 */

/*
Writes an image to the database

uid - Firebase unique id,
image - serialized image.
 */
function writeImageToDB(uid, image) {
  console.log("in writeImageToDB");
  let ref = db.ref('images/' + uid).push();

  ref.set({image: image})
      .catch (function(error) {
          let errorCode = error.code;
          let errorMessage = error.message;
          if (errorCode && errorMessage) {
              console.log(errorCode);
              console.log(errorMessage);
          }
      });
}

/*
Sends a serialized image to a socket.

uid - Firebase unique id,
index - Index of a requested image,
sid - Socket id.
 */
function readImageFromDB(uid, index, sid) {
    let ref = db.ref('images/' + uid);

    let firstQuery = ref.orderByKey();

    return firstQuery.once('value')
        .then (function(snapshot) {
            let i = 0;
            let sent = false;
            snapshot.forEach(function (child) {
                if (index === i) {
                    let image = child.val().image;
                    console.log("trying to emit to " + sid);
                    sent = true;
                    io.to(sid).emit('retreivedImage', image);
                }

                i++;
            });
            if (!sent) {
                io.to(sid).emit('retreivedImage', null);
            }
        });
}

/*
Writes an image to the database

uid - Firebase unique id,
image - serialized image.
 */
function writeNicknameToDB(uid, nickname, sid) {
    console.log("in writeNicknameToDB");
    let ref = db.ref('nicknames/' + uid);

    ref.set({nickname: nickname})
        .then (function () {
            io.to(sid).emit('nicknameFromDB', nickname);
        })
        .catch (function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode && errorMessage) {
                console.log(errorCode);
                console.log(errorMessage);
            }
        });
}
