$(function () {
var socket = io();
var userPref = new Array();

$('form').submit(function(){
	//event.preventDefault();
	if($('#m').val().startsWith("\\nickcolor")){
		oldName = userPref.name;
		userPref.color= '#' + $('#m').val().split(" ")[1];
		$('#m').val('');
		socket.emit('updatePrefs', {oldName,userPref});
	}
	else if($('#m').val().startsWith("\\nick")){
		oldName = userPref.name;
		userPref.name=$('#m').val().split(" ")[1];
		$('#m').val('');
		socket.emit('updatePrefs', {oldName,userPref});
		info = "You are: " + userPref.name;
		document.cookie = "username=" + userPref.name;
		document.getElementById('user').innerHTML=info;
	}
	else{
		let msg= {sender: userPref, message: $('#m').val()}
		socket.emit('chat message', msg);
		$('#m').val('');
	}
	return false;
	});

	socket.on('updateOnlineList', function(users){
		document.getElementById("users").innerHTML='';
		for(i = 0; i < users.length; i++)
			$('#users').append($('<li>' + users[i].name + '</li>'));
		//console.log(users);
	});

	socket.on('updateHistory', function(messages){

		//console.log("GOTHEA");
		//console.log(messages);

		for(i = 0; i < messages.length; i++){
			if(messages[i].sender.name === userPref.name){
				$('#messages').append($('<li><strong><span style="color:' +
				messages[i].sender.color + '">'+ '[' + messages[i].time + '] '+ messages[i].sender.name +
				'</span>: '  + messages[i].message + '</strong></li>'));


			}
			else{
				$('#messages').append($('<li><span style="color:' +
				messages[i].sender.color + '">'+ '[' + messages[i].time + '] '+ messages[i].sender.name +
				'</span>: '  + messages[i].message + '</li>'));
			}
		}

	});

	socket.on('chat message1', function(msg){
		if(msg.sender.name === userPref.name){
			$('#messages').append($('<li><strong><span style="color:' +
			msg.sender.color + '">'+ '[' + msg.time + '] '+ msg.sender.name  + '</span>: '
			+ msg.message + '</strong></li>'));
		}
		else{
			$('#messages').append($('<li><span style="color:' +
			msg.sender.color + '">'+ '[' + msg.time + '] '+ msg.sender.name +'</span>: '  + msg.message + '</li>'));
		}
		window.scrollTo(0, document.body.scrollHeight);
	});

	socket.on('connect', function(){

		var findCookie = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if(findCookie)
			socket.emit('addUser', {name:findCookie, color:'#000000'})
		else{
			let username = "Placeholder";
			socket.emit('setuser', {name:username, color:'#000000'});
		}
		socket.emit('updateOnlineList');

	});

	socket.on('getUsers', function(){
		socket.emit('updateUsers', userPref);

	});

	socket.on('setUser', function(user){
		userPref = user;
		info = "Username: " + user.name;
		document.getElementById('user').innerHTML=info;

		document.cookie = "username=" + user.name;

	});

});

function updateScroll(){
	var element = document.getElementById("messages");
	element.scrollTop = element.scrollHeight;
}
