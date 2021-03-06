var socket = io();
var word;
var userID;
var userName; //for authentication change this name
var userColor;
var canvas;
var disconnect = false;
var localQueueStore;
var localScoreStore;
var photoIndex = 0;


//get this sockets id
socket.on('pushSocketID', function(thisUserID){
  userID = thisUserID;
  console.log(userID);
});

//get this sockets id
socket.on('nicknameFromDB', function(nickname) {
    //set clients nick name to be userName
    console.log(nickname);
    userName = nickname;
    document.getElementById('usersName').innerHTML=userName;
    console.log(userName);
    //send to server to change drawUsers and scoreBoardUsers nicknames
    socket.emit('changeNickName', nickname);
});

//get this socket it's name
socket.on('pushSocketName', function(thisUserName){
  userName = thisUserName;
  //show to user on a visual display
  document.getElementById('usersName').innerHTML=userName;
  console.log(userName);
});

//listen for this clients color, and update the html element for it
socket.on('thisUserColor', function(thisUserColor){
  userColor = thisUserColor;
  console.log(userColor);
  $('#usersName').css('color', userColor);
});

//get the person whos drawing
socket.emit('getWhosDrawing');

//set your divs to be who you are
socket.on('whosDrawing', function(currentDrawingUser){
  //if you are drawing load elements to draw
  if(currentDrawingUser == userID){
    $('#outer').empty();

    console.log("I am now drawing");
    console.log("currentDrawingUser: " + currentDrawingUser);
    $('#outer').append('<h1 id="wordHeading">Your word is: <span id = word>null</span></h1>')
    $('#outer').append('<div id="cont"> <canvas id="draw" width="800" height="600"></canvas> <canvas id="cursor" width="800" height="600"></canvas></div>');
    $('#outer').append('<h1 style="float:right;"><span id="timeLeft">Time left: </span> <span id = time> </span></h1>');
    $('#outer').append('<h2><span id="timeLeft">Brush: </span><input id="color" type="color" value="#000000"></h2>')
    $('#outer').append('<input id="size" type="range" min="1" max="100" step="1" value="20" align="right">')
    $('#guessbox').empty();
    $('#guessbox').append('<input disabled placeholder="Chat disabled for drawer." type="text" onkeypress="checkForEnter(event)" id = "myGuess">');

    $('#guessbox').append('<button  disabled id="submitGuess" class="btn-group-square">Send</button>');
    $('#guessbox').append('<script> function checkForEnter(event){ if (event.which === 13){submitGuess();}}</script>');
    drawingModeClient();

  }
  //otherwise you are the listener
  else{
    if(disconnect==false){
      $('#outer').empty();

      console.log("I am listening");
      console.log("currentDrawingUser: " + currentDrawingUser);
      $('#outer').append('<h1><span id="timeLeft">Time left: </span><span id = time> </span></h1>')
      $('#outer').append('<div id="cont"> <canvas id="draw" width="1000" height="600"></canvas></div>');

      $('#guessbox').empty();
      $('#guessbox').append('<input type = "text" onkeypress="checkForEnter(event)" id = "myGuess">');
      $('#guessbox').append('<button id = "submitGuess">Send</button>');
      $('#guessbox').append('<script> function checkForEnter(event){ if (event.which === 13){submitGuess();}}</script>');


      var button = document.getElementById("submitGuess");

      button.onclick = submitGuess;
      listenerModeClient();
    }

    //otherwise if its true do nothing
    else{

    }
  }
});

function listenerModeClient(){
  canvas = new fabric.StaticCanvas("draw", {

  });

  //get the current time left from the server and display it
  socket.on('send current time', function(currentTime){
    //console.log(currentTime);
    if(disconnect != true){
      document.getElementById("time").innerHTML = currentTime;
    }
  });

  socket.on('receive data', function(data){
    //console.log(data);
    canvas.loadFromJSON(data);
  });

  //get the cursor
  var cursor = new fabric.StaticCanvas("cursor");




}


/* Database */
function saveImg(){
  let obj = {};
  let imageString = JSON.stringify(canvas);
  firebase.auth().currentUser.getIdToken(true)
    .then(function (idToken) {
      obj.token = idToken;
      obj.image = imageString;
      socket.emit('saveCanvas', obj);
    })
    .catch (function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        if (errorCode && errorMessage) {
          console.log(errorCode);
          console.log(errorMessage);
        }
    });
}

function getImg(){
  let obj = {};
  obj.index = 3;
  firebase.auth().currentUser.getIdToken(true)
    .then(function (idToken) {
      obj.token = idToken;
      console.log("hi there");
      socket.emit('readCanvas', obj);
    })
    .catch (function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        if (errorCode && errorMessage) {
          console.log(errorCode);
          console.log(errorMessage);
        }
    });
}

socket.on('retreivedImage', function(img){
  console.log("sup");
  if (!(img == null)) {
      canvas.loadFromJSON(img);
  } else {
      console.log('pizda');
      photoIndex--;
  }
});


function drawingModeClient(){
  //get the drawing word
  socket.emit('getDrawingWord');

  //variable that controls how offen we send packets to Server
  //var breakPoint = 0;

  //listen for a responce from server for the word you have to draw
  socket.on('recvWord', function(responce){
    word = responce;
    document.getElementById("word").innerHTML = word;
  });

  //get the current time left from the server and display it
  socket.on('send current time', function(currentTime){
    //console.log(currentTime);
    if(disconnect != true){
      document.getElementById("time").innerHTML = currentTime;
    }
  });

  //set the new canvas to be able to draw
  canvas = new fabric.Canvas("draw", {
    isDrawingMode: true,
    freeDrawingCursor: 'none'
  });

  //get the cursor
  var cursor = new fabric.StaticCanvas("cursor");

  //initalize the brushes width and color
  canvas.freeDrawingBrush.width = 20;
  canvas.freeDrawingBrush.color = '#000000';

  //set cursorOpacity to 50%
  var cursorOpacity = .5;
  //make the mousecursor a circle with the below attributes
  var mousecursor = new fabric.Circle({
    left: -100,
    top: -100,
    radius: canvas.freeDrawingBrush.width / 2,
    fill: "rgba(196,196,196," + cursorOpacity + ")",
    stroke: "black",
    originX: 'center',
    originY: 'center'
  });

  //add the cursor to the canvas
  cursor.add(mousecursor);

  //when the mouse moves
  canvas.on('mouse:move', function (evt) {
    var mouse = this.getPointer(evt.e);
    mousecursor
      .set({
        top: mouse.y,
        left: mouse.x
      })
      .setCoords()
      .canvas.renderAll();
  });

  canvas.on('mouse:out', function () {
    // put circle off screen
    mousecursor
      .set({
        top: -100,//mousecursor.originalState.top,
        left: -100 //mousecursor.originalState.left
      })
      .setCoords()
      .canvas.renderAll();
  });

  canvas.on('mouse:up', function(){
    //console.log(JSON.stringify(canvas));
    socket.emit('push data', JSON.stringify(canvas));
  });

  //while brush size is changed
  document.getElementById("size").oninput = function () {
    var size = this.value;
    mousecursor
      .center()
      .set({
        radius: size/2
      })
      .setCoords()
      .canvas.renderAll();
  };

  //after brush size has been changed
  document.getElementById("size").onchange = function () {
    var size = parseInt(this.value, 10);
    canvas.freeDrawingBrush.width = size;
    mousecursor
      .set({
        //left: mousecursor.originalState.left,
        //top: mousecursor.originalState.top,
        radius: size/2
      })
      .setCoords()
      .canvas.renderAll();
  };

  //change drawing color
  document.getElementById("color").onchange = function () {
    canvas.freeDrawingBrush.color = this.value;
    var bigint = parseInt(this.value.replace("#", ""), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    //mousecursor.fill = "rgba(" + [r,g,b,cursorOpacity].join(",") + ")";
  };
}


function submitGuess(){
  var guessText = document.getElementById("myGuess").value;

  console.log("your word is: "+ guessText);
  socket.emit('chat message', guessText, userName, userColor);

  //erase guess field
  document.getElementById("myGuess").value = "";
};

socket.on('correctGuess', function(score){
  console.log("you were right");
  $('#scoreField').empty()
  .append(' Your Score: ' + score);
  /*
  var button = document.getElementById("submitGuess");

  button.onclick = function(){};

  */
  //$('#guessbox').append('<h1>Congratulations! you guessed correctly</h1>');

});

//then this is called by the server update the scoreboard fro the client to see
socket.on('updateScoreBoard', function(arrayOfScores){
  //first empty the scoreboard
  $('#scoreBoard').empty();

  //now initalize the scoreboard with the appropriate updated values
  for(var i = 0; i < arrayOfScores.length; i++){
    //take the i'th player and append him to the scoreboard
      $('#scoreBoard').append('<h2 id="scoreboardText"><font color =' + arrayOfScores[i].color + '>' + arrayOfScores[i].userName + '</font>' + ": " + arrayOfScores[i].score + '</h2>')
  }
});

//when given a client message broadcast it to the side
socket.on('broadcastMessage', function(givenMessage, msgUser, msgColor, timeGiven){
  console.log("test");

  $('#messages').append('<li>' + '<font color =' + msgColor + '>' + timeGiven + msgUser + ": "+ '</font>' +  givenMessage + '</li>');
  $('#messages').scrollTop($('#messages')[0].scrollHeight);
});

//listen for server messages and print them on the chat
socket.on('serverMessage', function(userCorctGuess, serverMsg, usersMsgColor){
  $('#messages').append('<li>' + '<i>' + '<font color =' + usersMsgColor + '>' + userCorctGuess +'</font>' +  serverMsg + '</i>' + '</li>');
  $('#messages').scrollTop($('#messages')[0].scrollHeight);
});
