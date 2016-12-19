var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
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
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	//Send Message
	socket.on('send message', function(data, avatar, add){
		console.log(typeof data);
		if (add)
			io.sockets.emit('new message', {msg: data, user: socket.username, avatar: socket.avatar});
		else
		{
			socket.username = data;
			socket.avatar = avatar;
			updateUsernames();
		}
	});

	//New User
	socket.on('new user', function(data, avatar, add, callback){
		callback(true);
		socket.username = data;
		socket.avatar = avatar;
		if(add){
		users.push(socket.username);
		}
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});