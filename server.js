var mysql = require('mysql');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
avatars = [];
colors = [];
glows = [];
connections = [];
html = [];
pcid = [];
usersocket = [];
var id = 0;
//transports: ['polling']
app.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT ||3000);
console.log('Server running...');

//Mysql Connection
var connection = mysql.createConnection({
	host: 'sql7.freesqldatabase.com',
	user: 'sql7151225',
	password: 'eAAvdHtXSN',
	database: 'sql7151225'
});
//var connection = mysql.createConnection(
//	'mysql://thehiddenr:FireAce32@85.10.205.173'
//);
var res = connection.connect();
console.log(res);
//End Mysql Connection

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
			usersocket.splice(usersocket.indexOf(socket), 1);
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

		pc = [];
		pc.push(name);
		pc.push(socket.username);
		pc.sort();
		id = pc[0] + pc[1];

		io.sockets.emit('get user info', {name: name, avatar: avatars[user], color: colors[user], glow: glows[user], html: html[pcid.indexOf(id)]});
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

	socket.on('join', function (data) {

		pc = [];
		pc.push(data.user);
		pc.push(socket.username);
		pc.sort();
		id = pc[0] + pc[1];
		if (pcid.indexOf(id) == -1)
		{
			html.push('<li class="list-group-item affichage color"><img src="' + socket.avatar + '" id="avatar" class="color"/><span style="color:' + socket.color + ';' + returnGlow(socket.glow) + '">' + socket.username + '</span><br /><strong>' + data.msg  +'</strong></li>');
			pcid.push(id);
		}
		else
			html[pcid.indexOf(id)] = html[pcid.indexOf(id)] + '<li class="list-group-item affichage color"><img src="' + socket.avatar + '" id="avatar" class="color"/><span style="color:' + socket.color + ';' + returnGlow(socket.glow) + '">' + socket.username + '</span><br /><strong>' + data.msg  +'</strong></li>';
		socket.join(id);
		usersocket[users.indexOf(data.user)].emit('alert', {sender: socket.username});
		io.sockets.in(id).emit('private message', {msg: data.msg, user: socket.username, avatar: socket.avatar, color: socket.color, glow: socket.glow, id: id, html: html[pcid.indexOf(id)]});
		console.log(id);
		// We are using room of socket io
	});


	//New User
	socket.on('new user', function(data, password, avatar, color, glow, add, callback){

		//mysql query login
		connection.query('SELECT * FROM kchat_users WHERE username = "' + data+ '" AND user_password = "' + password + '"', function (err, rows, fields) {
			if (err) { //if there is an error in the mysql query
				callback(false);
			} else {
				if (rows.length != 0) {
					//if username & password are good, callback true, user connected
					if (rows[0]['username'] == data && rows[0]['user_password'] == password) {
						console.log('user connected as : ', rows[0]['username']);
						callback(true);
					} else {
						//if wrong credentials (usually, this condition will not be used)
						console.error("user failed to login with credentials: " + data + " : " + password);
						callback(false);
					}
				} else {
					//if wrong credentials (0 db return)
					console.error("user failed to login with credentials: " + data + " : " + password);
				}
			}
		});


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
			usersocket.push(socket);
		}
		updateUsernames();
	});

	//new register
	socket.on('register user', function(username, password, avatar, callback) {
		var  registered = false;
		//check if username if not taken
		connection.query('SELECT * from kchat_users WHERE username = "'+username+'"', function(err, rows, fields){
			if (err) {
				console.log('error here');
				callback(false);
				registered = false;
			} else {
				if (rows.length != 0) {
					console.log("rows"+rows);
					callback(false);
					registered = false;
				} else {
					console.log('here: ' + registered);
					callback(true);
					registered = true;
				}
			}

			console.log(registered);

			if (registered == true) {
				connection.query('INSERT INTO kchat_users VALUES("", "'+username+'", "'+password+'")', function(err) {
					if (err) {
						callback(false);
						console.error(err);
					} else {

						console.log('succes');
					}

				});
			}

			socket.username = username;
			socket.avatar = avatar;
			socket.glow = "";
			socket.color = "";

			io.sockets.emit('new message', {msg: username, user: socket.username, avatar: socket.avatar, color: socket.color, glow: socket.glow, alert: 1});
			avatars.push(socket.avatar);
			colors.push(socket.color);
			glows.push(socket.glow);
			users.push(socket.username);
			usersocket.push(socket);
			updateUsernames();
		});
		});



	function returnGlow(data)
	{
		if (data != "")
			return "text-shadow: 0px 0px 5px" +  data + ";";
		else
			return "";
	}

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}

});