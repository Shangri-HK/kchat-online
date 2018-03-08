/**
 * Created by HARDCORE on 27/12/2016.
 */

$(document).ready(function() {
	console.log('Start');
    var socket = io.connect();
    var audio = new Audio('notif.mp3');
    var $messageForm = $('#messageForm');
    var $privateMessageForm = $('#privateMessageForm');
    var $message = $('#message');
    var $privateMessage = $('#privateMessage');
    var $chat = $('#chat');
    var $privateChat = $('#privateChat');
    var $userForm = $('#userForm');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $users = $('#users');
    var $username = $('#username');
    var $settings = $('#settings');
    var $config = $('#config');
    var $avatarLink = $('#avatarLink');
    var $image = $('#image');
    var $pseudo = $('#pseudo');;
    var $prevImage;
    var $prevPseudo = '';
    var $cinema = $('#cinema');
    var $youtubeLink = $('#youtubeLink');
    var $background = $('#background');
    var $colorTheme = $('#colorTheme');
    var $usernameColor = $('#usernameColor');
    var $usernameGlow = $('#usernameGlow');
    var isCinema = false;
    var youtubeId;
    var logName;
    var usernameInfo;
    var avatarInfo;
    var colorInfo;
    var glowInfo;
    var html;


    $messageForm.submit(function(e){
        e.preventDefault();
        socket.emit('send message', $message.val(), null, null, null, true);
        socket.emit('writing', logName, true);
        $message.val('');
    });

    $privateMessageForm.submit(function(e){
        e.preventDefault();
        var privateText = $privateMessage.val();

        privateText = isYoutube(privateText);
        privateText = isImg(privateText);
        privateText = emojis(privateText);
        privateText = linkify(privateText);
        socket.emit('join', {user: usernameInfo, msg: privateText});
        socket.emit('writing', logName, true);
        $privateMessage.val('');
    });

    socket.on('alert', function(data){
        document.getElementById(data.sender).style.background = "white";
        document.getElementById(data.sender).style.borderRadius = "0 10px 0 20px";
    });

    socket.on("private message", function(data) {
        $('#privateChat').html(data.html);
        x.scrollTop = x.scrollHeight;
        audio.volume = 0.2;

        alert(readCookie("sound"));
        //$('#privateChat').append('<li class="list-group-item affichage color"><img src="' + avatarInfo + '" id="avatar" class="color"/><span style="color:'  + ';'  + '">'  + '</span><br /><strong>' + data.msg  +'</strong></li>');
    });

    socket.on('is writing', function(data)
    {
        if (data.stop == false) {
            if (data.name != null)
                document.getElementById(data.name).innerHTML = data.name + '<strong> ✎...</strong>';
        }
        else {
            if (data.name != null)
                document.getElementById(data.name).innerHTML = data.name;
        }
    });


    //Message emit on chat or on user's connection/deconnection
    socket.on('new message', function(data){
        if (data.alert == 0){
            var text = linkify(escapeHtml(data.msg));
            var today = new Date();

            text = isYoutube(text);
            text = isImg(text);
            text = emojis(text);
            if (readCookie("textStyle") == "bold")
                $chat.append('<li class="list-group-item affichage color"><img src="' + escapeHtml(data.avatar) + '" id="avatar" class="color"/><span style="color:' + data.color + ';' + returnGlow(data.glow) + '">' + escapeHtml(data.user) + '   ' /*+ today*/ + '</span><span id="time"></span><br /><strong>' + text  +'</strong></li>');
            else
                $chat.append('<li class="list-group-item affichage color"><img src="' + escapeHtml(data.avatar) + '" id="avatar" class="color"/><strong style="color:' + data.color + ';' + returnGlow(data.glow) + '">' + escapeHtml(data.user) + '   ' /*+ today*/ + '</strong><br />' + text  +'</li>');
        }
        else if (data.alert == 1)
            $chat.append('<li class="list-group-item affichage" style="background-color: grey; height: 20px;font-size: 10px; overflow:hidden; padding-top: 2px;"><strong>' + data.user + ' is connected.<strong/>')
        else
            $chat.append('<li class="list-group-item affichage" style="background-color: grey; height: 20px;font-size: 10px; overflow:hidden; padding-top: 2px;"><strong>' + data.user + ' has disconnected.<strong/>')
        var x = document.getElementById('chat');
        x.scrollTop = x.scrollHeight;
        audio.volume = 0.2;
        if (readCookie("sound") == "Y")
            audio.play();
    });


    //Add the user's informations at login
    $("#login").click(function(e){
    	console.log('here x');
        e.preventDefault();
        socket.emit('new user', $username.val(), $('#password').val(), $avatarLink.val(), readCookie("usernameColor"), readCookie("usernameGlow"), true, function(data){
            console.log("data from login : " + data);
            if(data == true)
            {
                $userFormArea.hide();
                $messageArea.fadeIn();
                createCookie("username", $username.val());
                createCookie("avatar", $avatarLink.val());
                logName = $username.val();
                $('#cinemaOn').fadeIn();
                changeColor(readCookie("colorTheme"));

            } else {
                $('#errorLogin').show();
            }
        });
        if (typeof readCookie("background") != "undefined")
            document.getElementById('body').style.backgroundImage = "url(background.jpg)";
        else
            document.getElementById('body').style.backgroundImage = "url(" + readCookie("background") + ")";
        //document.getElementById('pseudo').value = $username.val();
        //$username.val('');
    });

    //Show the users online on the sidebar
    socket.on('get users', function(data){
        var html = '';
        for(i = 0; i < data.length; i++)
        {
            html += '<li class="onlineUser" id="' + data[i] + '" onclick="userInfo(this.id, '+data[i]+')">' + escapeHtml(data[i]) + '</li>';
        }
        $users.html(html);
    });

    $('#registerButton').click(function() {
        $('#registerFormArea').show();
        $('#userFormArea').hide();
    });

    //Register new user
    $("#register").click(function(e) {
        e.preventDefault();

        var registerUsername = $('#registerUsername').val();
        var registerPassword = $('#registerPass').val();
        var registerAvatar = $('#registerAvatar').val();

        //register user
        socket.emit('register user', registerUsername, registerPassword, registerAvatar, function(isRegistered) {
            console.log("registered:" + isRegistered);

            if (isRegistered == true) {
                $('#registerFormArea').hide();

                //then connect as normal user
                socket.emit('new user', registerUsername, registerPassword, registerAvatar, "", "", true, function(data){
                    if(data == true)
                    {
                        //console.log(data);
                        $userFormArea.hide();
                        $messageArea.fadeIn();
                        createCookie("username", registerUsername);
                        createCookie("avatar", registerAvatar);
                        logName = registerUsername.val();
                        $('#cinemaOn').fadeIn();
                        changeColor(readCookie("colorTheme"));

                    } else {
                        $('#errorLogin').show();
                    }
                });

            } else {
                $('#errorRegister').show();
            }
        });




        if (typeof readCookie("background") != "undefined")
            document.getElementById('body').style.backgroundImage = "background.jpg";
        else
            document.getElementById('body').style.backgroundImage = "url(" + readCookie("background") + ")";
        document.getElementById('pseudo').value = $username.val();
    });
});
