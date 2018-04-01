var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let users = new Array();
let messages = new Array();
let userNum = 0;
let sockets = new Array();

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});

function DisplayCurrentTime() {
	var date = new Date();
	var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	time = hours + ":" + minutes + ":" + seconds;
	return time;
};


io.on('connection', function(socket){
	
	io.emit('updateOnlineList', users);
	io.emit('updateHistory', messages);
	console.log(sockets.includes(socket.id));
	sockets.push(socket.id);
	console.log(sockets);

	socket.on('chat message', function(msg){
		msg.time = DisplayCurrentTime();
		messages.push(msg);
		io.emit('chat message', msg);
		console.log(messages);
	});

	socket.on('updateUsers', function (userPref) {
		users.push(userPref);
		io.emit('updateOnlineList', users);
	});

	socket.on('updateOnlineList', function () {
		io.emit('updateOnlineList', users);
	});

	socket.on('disconnect', function(){
		users = [];
		io.emit('getUsers');


	});

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
		console.log("GOTHERE");
		for(i=0; i < users.length; i++){
			if(users[i]['name'] === update.oldName)
				users[i] = update.userPref;
		}
		io.emit('updateOnlineList', users);
		console.log(users);
	});

});

http.listen(port, function(){
});

function genName(){

	let username = "user" + userNum;

	return username;
}

function randColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
