var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
avatars = [];
colors = [];
glows = [];
connections = [];
//transports: ['polling']
app.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT ||3000);
console.log('Server running...');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		if (socket.username != null)
		{
			avatars.splice(users.indexOf(socket.username), 1);
			colors.splice(users.indexOf(socket.username), 1);
			glows.splice(users.indexOf(socket.username), 1);
			users.splice(users.indexOf(socket.username), 1);
			io.sockets.emit('new message', {msg: data, user: socket.username, avatar: socket.avatar, alert: 2});
			updateUsernames();
			connections.splice(connections.indexOf(socket), 1);
			console.log('Disconnected: %s sockets connected', connections.length);
		}
		
	});

	//socket.on('close', function(){
	//this.transport.close();
	 //});

	 socket.on('writing', function(name, stop)
	 {
	 	io.sockets.emit('is writing', {name: socket.username, stop: stop});
	 });

	 socket.on('user info', function(name, avatar, color, glow)
	 {
	 	var user = users.indexOf(name);

	 	io.sockets.emit('get user info', {name: name, avatar: avatars[user], color: colors[users], glow: glows[user]});
	 });


	//Send Message
	socket.on('send message', function(data, avatar, color, glow, add){
		if (add)
			io.sockets.emit('new message', {msg: data, user: socket.username, avatar: socket.avatar, color: socket.color, glow: socket.glow, alert: 0});
		else
		{
			socket.username = data;
			socket.avatar = avatar;
			socket.color = color;
			socket.glow = glow;
			//updateUsernames();
		}
	});

	//New User
	socket.on('new user', function(data, avatar, color, glow, add, callback){
		callback(true);
		socket.username = data;
		socket.avatar = avatar;
		socket.color = color;
		socket.glow = glow;
		if(add){
			io.sockets.emit('new message', {msg: data, user: socket.username, avatar: socket.avatar, color: socket.color, glow: socket.glow, alert: 1});
		avatars.push(socket.avatar);
		colors.push(socket.color);
		glows.push(socket.glow);
		users.push(socket.username);
		}
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});