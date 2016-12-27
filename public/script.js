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

//Setting inputs from cookies
$username.val(readCookie("username"));
$avatarLink.val(readCookie("avatar"));
$pseudo.val(readCookie("username"));
$image.val(readCookie("avatar"));
$usernameColor.val(readCookie("usernameColor"));
$usernameGlow.val(readCookie("usernameGlow"));
$background.val(readCookie("background"));
document.getElementById('body').style.backgroundImage = "url(background.jpg)";


//Change the theme
function changeColor(data)
{
	document.getElementById('header').style.backgroundColor = data;
	document.getElementById('settings').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('ok').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('ok').style.border = "1px solid " + hexToRgba(data, "0.7");
	document.getElementById('settings').style.border = "1px solid " + hexToRgba(data, "0.7");
	document.getElementById('cinemaOn').style.border = "1px solid " + hexToRgba(data, "0.7");
	document.getElementById('cinemaOn').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('cinemaOut').style.border = "1px solid " + data;
	document.getElementById('cinemaOut').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('sound').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('sound').style.border = "1px solid " + hexToRgba(data, "0.7");
	document.getElementById('textStyle').style.backgroundColor = hexToRgba(data, "0.7");
	document.getElementById('textStyle').style.border = "1px solid " + hexToRgba(data, "0.7");
	document.getElementById('message').style.background = hexToRgba(data, "0.4");
	document.getElementById('message').style.border = "1px solid " + hexToRgba(data, "0.7");

	createCookie("colorTheme", data);
}


//Enable the cinema mode
function cinemaOn()
{
	isCinema = true;
	$('#cinema').fadeIn();
	document.getElementById('cinemaOut').style.display = "initial";
	document.getElementById('chat').style.height = "320px";
	document.getElementById('userInfo').style.height = "320px";
	document.getElementById('message').style.height = "40px";
	//document.getElementById('container').style.marginTop = "0px";
	//document.getElementById('chat').style.marginBottom = "0px";
	document.getElementById('userList').style.height = "320px";
	document.getElementById('chatWindow').style.height = "320px";
	if (readCookie("background") != "" && readCookie("background") != null)
		$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url(' + readCookie("background") + ')'});
	else
		$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url(background.jpg)'});
	document.getElementById('cinemaOn').style.display = "none";
	window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
	//window.scrollTo(0,document.body.scrollHeight).fadIn();
	//$('html, body').css({'height': '100%'};
}


//Disable cinema mode
function cinemaOut()
{
	isCinema = false;
	$('#cinema').fadeOut();
	document.getElementById('youtubeWindow').src = "https://www.youtube.com/embed/";
	document.getElementById('cinemaOut').style.display = "none";
	document.getElementById('chat').style.height = "600px";
	document.getElementById('userInfo').style.height = "600px";
	document.getElementById('message').style.height = "100px";
	document.getElementById('userList').style.height = "600px";
	document.getElementById('chatWindow').style.height = "600px";
	$('#cinemaOn').fadeIn();
	if (readCookie("background") != "" && readCookie("background") != null)
	{
		$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) ), url(' + readCookie("background") + ')'});
	}
	else
		$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) ), url(background.jpg)'});
}


//Enable the settings window
function showConfig()
{
	document.getElementById('config').style.display = "block";
	document.getElementById('ok').style.display = "initial";
	document.getElementById('usersCol').style.display = "none";
	document.getElementById('settings').style.display = "none";
	document.getElementById('image').value = escapeHtml($image.val());
	document.getElementById('pseudo').value = escapeHtml($pseudo.val());
	$pseudo.val(readCookie("username"));
	$image.val(readCookie("avatar"));
	$usernameColor.val(readCookie("usernameColor"));
	$usernameGlow.val(readCookie("usernameGlow"));
	$background.val(readCookie("background"));
}

function autoLaunch()
{
	if (isCinema == false)
		cinemaOn();
	$youtubeLink.val(youtubeId);
	launchVideo();
}

function isImg(data)
{
	var href = data.split('"')[1];
	if(href != null)
		var embed = href.split('/');
	else
		return data;
	var img = embed[embed.length - 1].split('.');
	if (img[0].indexOf("?") != -1)
		return data;
	if(img[1] == "jpg" || img[1] == "png" || img[1] == "bmp" || img[1] == "gif" || img[1] == "jpeg")
		return '<img src="' + href + '" style="height: 200px; width: auto;"/>' + data;
	return data;
}

function isYoutube(data)
{
	var href = data.split('"')[1];
	if(href != null)
		var embed = href.split('/');
	else
		return data;
	if (embed != null)
	{
		for (var i = 0; i < embed.length; i++)
		{
			if (embed[i] == "www.youtube.com" || embed[i] == "www.youtube.com&quot" || embed[i] == "www.youtu.be" || embed[i] == "www.youtu.be&quot")
			{
				youtubeId = embed[i] + "/" + embed[++i];
				return data + '  ' + '<a id="myLink" href="#" onclick="autoLaunch()">' + ' <strong style="color:black;">► play on cinema mode.</strong></a>';
			}
		}
	}
	return data;
}


//Initialize the youtube video link
function launchVideo()
{

	var link = $youtubeLink.val();
	var embed = link.split('/');
	for (var i = 0; i < embed.length; i++)
	{
		if (embed[i] == "www.youtube.com")
		{
			document.getElementById('youtubeWindow').src = "https://www.youtube.com/embed/" + embed[i+1].split('=')[1].split('&')[0] + "?rel=0&autoplay=1";
		}
	}
}


//Return the text-shadow CSS correctly
function returnGlow(data)
{
	if (data != "")
		return "text-shadow: 0px 0px 5px" +  data + ";"
	else
		return "";
}


//Set the options selected
function changeInfo()
{
	//document.getElementById(logName).innerHTML = $pseudo.val();
	if ($colorTheme.val() != "")
		changeColor(escapeHtml($colorTheme.val()).toString());
	if ($usernameColor.val() != "")
	{
		createCookie("usernameColor", escapeHtml(document.getElementById('usernameColor').value));
	}
	else
		createCookie("usernameColor", "");
	if ($usernameGlow.val() != "")
	{
		createCookie("usernameGlow", escapeHtml(document.getElementById('usernameGlow').value));
	}
	else
		createCookie("usernameGlow", "");
	if (escapeHtml($background.val()) == "")
		if (isCinema == true)
			$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url(background.jpg)'});
		else
			document.getElementById('body').style.backgroundImage = "url(background.jpg)";
	else
	if (isCinema == true)
		$('#body').css({'background': 'linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url(' + escapeHtml($background.val()) + ')'});
	else
		document.getElementById('body').style.backgroundImage = "url(" + escapeHtml($background.val()) + ")";
	createCookie("background", escapeHtml($background.val()));
	socket.emit('send message', document.getElementById('pseudo').value, document.getElementById('image').value, escapeHtml(document.getElementById('usernameColor').value), escapeHtml(document.getElementById('usernameGlow').value), false);
	createCookie("username", document.getElementById('pseudo').value);
	createCookie("avatar", document.getElementById('image').value);
	showOffSettings();
}

function soundOnOff()
{
	if (readCookie("sound") == "N")
		createCookie("sound", "Y");
	else
		createCookie("sound", "N");
}

function textBold()
{
	if (readCookie("textStyle") == "none")
		createCookie("textStyle", "bold");
	else
		createCookie("textStyle", "none");
}
//Disable the settings sidebar
function showOffSettings()
{
	document.getElementById('config').style.display = "none";
	document.getElementById('ok').style.display = "none";
	document.getElementById('usersCol').style.display = "block";
	document.getElementById('settings').style.display = "initial";
	//document.getElementById('settings').style.marginTop = "182px";
}


//Create the cookie
function createCookie(name,value) {
	document.cookie = name+"="+escapeHtml(value);
}


//Read the cookie
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for( var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


//Protect from html injection
function escapeHtml(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


//Make a html link
function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

	return replacedText;
}

function emojis(data)
{
	data = data.replace(":)", '<img class="emojis" src="emojis/smile.svg" />');
	data = data.replace(":(", '<img class="emojis" src="emojis/frown.svg" />');
	data = data.replace(":&#039;(", '<img class="emojis" src="emojis/crying.svg" />');
	data = data.replace(":o", '<img class="emojis" src="emojis/surprised.svg" />');
	data = data.replace(":@", '<img class="emojis" src="emojis/angry.svg" />');
	data = data.replace("D:", '<img class="emojis" src="emojis/anguished.svg" />');
	data = data.replace("xo", '<img class="emojis" src="emojis/dead.svg" />');
	data = data.replace("-_-", '<img class="emojis" src="emojis/expressionless.svg" />');
	data = data.replace("8-)", '<img class="emojis" src="emojis/smileglasses.svg" />');
	data = data.replace(":p", '<img class="emojis" src="emojis/tongue.svg" />');
	data = data.replace(":P", '<img class="emojis" src="emojis/tongue.svg" />');
	data = data.replace(":$", '<img class="emojis" src="emojis/shy.svg" />');
	data = data.replace(":d", '<img class="emojis" src="emojis/happy.svg" />');
	data = data.replace(":d", '<img class="emojis" src="emojis/happy.svg" />');
	data = data.replace("(zbeub)", '<img class="emojis" src="emojis/zbeub.svg" />');
	data = data.replace("(u18)", '<img class="emojis" src="emojis/under18.svg" />');
	data = data.replace("(ok)", '<img class="emojis" src="emojis/ok.svg" />');
	data = data.replace("(l)", '<img class="emojis" src="emojis/heart.svg" />');
	data = data.replace("($)", '<img class="emojis" src="emojis/$.svg" />');
	data = data.replace("(b)", '<img class="emojis" src="emojis/beer.svg" />');
	data = data.replace("(loving)", '<img class="emojis" src="emojis/loving.svg" />');
	data = data.replace("(xd)", '<img class="emojis" src="emojis/XD.svg" />');
	data = data.replace("(XD)", '<img class="emojis" src="emojis/XD.svg" />');
	data = data.replace("(kiss)", '<img class="emojis" src="emojis/kiss.svg" />');
	data = data.replace("(fear)", '<img class="emojis" src="emojis/fear.svg" />');
	data = data.replace("(a)", '<img class="emojis" src="emojis/angel.svg" />');
	data = data.replace("(hehe)", '<img class="emojis" src="emojis/hehe.svg" />');
	data = data.replace(":&#039;)", '<img class="emojis" src="emojis/smile2.svg" />');
	return data;
}

function userInfo(id)
{
	socket.emit('user info', id);

	socket.on('get user info', function(data){
		usernameInfo = data.name;
		avatarInfo = data.avatar;
		colorInfo = data.color;
		glowInfo = data.glow;
		html = data.html;
	});
	if (isCinema == true)
		document.getElementById('userInfo').style.height = "320px";
	document.getElementById('chatWindow').style.display = "none";
	$('#message').fadeOut();
	document.getElementById('userAvatar').style.display = 'none';
	document.getElementById('usernameInfo').innerHTML = "";
	document.getElementById('usernameColorInfo').innerHTML = "";
	document.getElementById('privateChat').innerHTML = "";
	document.getElementById('usernameGlowInfo').innerHTML = "";
	$('#userInfo').fadeIn();
	$('#exitProfil').fadeIn();

	setTimeout(function dispUser() {
		if (isCinema == true)
			document.getElementById('userInfo').style.height = "320px";
		document.getElementById('chatWindow').style.display = "none";
		document.getElementById('message').style.display = "none";
		if (avatarInfo != "") {
			document.getElementById('userAvatar').style.display = 'block';
			document.getElementById('userAvatar').src = avatarInfo;
		} else {
			document.getElementById('userAvatar').style.display = 'none';
		}
		document.getElementById('usernameInfo').innerHTML = usernameInfo;
		document.getElementById('avatarInfo').innerHTML = '<a href="' + avatarInfo + '" target="_blank"><strong>' + avatarInfo + '</strong></a>';
		document.getElementById('usernameColorInfo').innerHTML = colorInfo;
		document.getElementById('usernameGlowInfo').innerHTML = glowInfo;
		document.getElementById(id).style.backgroundColor = "initial";
		$('#privateChat').html(html);
		$('#userInfo').fadeIn();
		$('#privateMessageForm').fadeIn();
		$('#privateChat').fadeIn();
		$('#exitProfil').fadeIn();
	}, 1000);

}

function isWriting()
{

	if ($message.val().length < 3 || $message.val() == null)
	{
		socket.emit('writing', logName, true);
	}
	else
		socket.emit('writing', logName, false);
}

function exitProfil()
{
	document.getElementById('userInfo').style.display = "none";
	document.getElementById('exitProfil').style.display = "none";
	document.getElementById('privateMessageForm').style.display = "none";
	$('#chatWindow').fadeIn();
	$('#message').fadeIn();
}

function hexToRgba(hex, opacity){
	var c;
	if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
		c= hex.substring(1).split('');
		if(c.length== 3){
			c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c= '0x'+c.join('');
		return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + opacity + ')';
	}
	throw new Error('Bad Hex');
}

//Make the enter button send message
$("#message").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		$(this).closest("form").submit();
		e.preventDefault();
		return false;
	}
});

$("#privateMessage").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		$(this).closest("form").submit();
		e.preventDefault();
		return false;
	}
});

//Enable the line break
$("#image").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		return false;
	}
});


//Enable the line break
$("#pseudo").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		return false;
	}
});


//Enable the line break
$("#colorTheme").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		return false;
	}
});


//Enable the line break
$("#usernameColor").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		return false;
	}
});


//Enable the line break
$("#usernameGlow").keypress(function (e) {
	if(e.which == 13 && !e.shiftKey)
	{
		return false;
	}
});

