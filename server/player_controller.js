var service = require("./service");
var Player = require("./player.js");

var sys = require('sys');

this.register = function(req, res, callback) {
    var params = req.query;
    Player.create({
		email: params.email,
		username: params.username,
		password: params.password
    }, function(response) {
		callback(response);
	});
}

this.login = function(email, password, callback) {
	Player.login(email, password, callback);
}


function is_player_name_valid(username) {
	return /^[A-Za-z0-9\_\-]+$/.test(username);
}

function is_email_valid(email) {
	return /^[a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
}

function is_password_valid(password) { return (password.length >= 6 && password.length <= 36); }