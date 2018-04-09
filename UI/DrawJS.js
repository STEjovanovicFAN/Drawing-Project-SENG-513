var socket = io();
var word;
var userID;

//get this sockets id
socket.on('pushSocketID', function(thisUserID){
  userID = thisUserID;
  console.log(userID);
});

//get the person whos drawing
socket.emit('getWhosDrawing');

//set your divs to be who you are
socket.on('whosDrawing', function(currentDrawingUser){
  //if you are drawing load elements to draw
  if(currentDrawingUser === userID){
    $('#outer').empty();

    console.log("I am now drawing");
    console.log("currentDrawingUser: " + currentDrawingUser);
    $('#outer').append('Color: <input id="color" type="color" value="#000000"><br/>')
    .append('Brush size: <input id="size" type="range" min="1" max="100" step="1" value="20"><br/>')
    .append('<h1>Your word is: <span id = word>null</span></h1>')
    .append('<h1>Time left: <span id = time> </span></h1>');

    $('#outer').append('<div id="cont"> <canvas id="draw" width="500" height="500"></canvas> <canvas id="cursor" width="500" height="500"></canvas></div>');

    drawingModeClient();

  }
  //otherwise you are the listener
  else{
    $('#outer').empty();

    console.log("I am not listening");
    console.log("currentDrawingUser: " + currentDrawingUser);
    $('#outer').append('<h1>Time left: <span id = time> </span></h1>')
    $('#outer').append('<div id="cont"><canvas id="draw" width="500" height="500"></canvas></div>');

    listenerModeClient();

  }
});

function listenerModeClient(){
var canvas = new fabric.StaticCanvas("draw", {

});

//get the current time left from the server and display it
socket.on('send current time', function(currentTime){
  //console.log(currentTime);
  document.getElementById("time").innerHTML = currentTime;
});

socket.on('receive data', function(data){
  //console.log(data);
  canvas.loadFromJSON(data);
});

//get the cursor
var cursor = new fabric.StaticCanvas("cursor");

/*//send message to the server with name and color
$('form').submit(function(){
  socket.emit('word guess', $('#m').val());
  $('#m').val('');
  return false;
});*/
}

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
  document.getElementById("time").innerHTML = currentTime;
});

//set the new canvas to be able to draw
var canvas = new fabric.Canvas("draw", {
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
/*
    //determine if we need to broadcast event to server
    if(breakPoint === 10){
      console.log("mouse moving");
      breakPoint = 0;
      document.elementFromPoint(x, y).click();
    }
    else{
      breakPoint++;
    }*/
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
