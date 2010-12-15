var service = require("./service");
var Player = require("./player.js");

this.register = function(res, req) {
    var params = req.query;
    
    var new_player = Player.create({
	email: params.email,
	username: params.username,
	password: params.password
    });
    
    //set auth cookie
    if(new_player.player != null)
        writeCookie(res, new_player.player);
	
    res.send(new_player.response);
}


function is_player_name_valid(username) {
	return /^[A-Za-z0-9\_\-]+$/.test(username);
}

function is_email_valid(email) {
	return /^[a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
}

function is_password_valid(password) { return (password.length >= 6 && password.length <= 36); }


function writeCookie(res, player) {
    var cookie = 'login=';
    cookie += (JSON.stringify({id: player.id() , session: player.session()}) + ';expires=2 Aug 2400 20:47:11 UTC; path=/');
    res.writeHead(200, {"Set-Cookie": cookie});
}