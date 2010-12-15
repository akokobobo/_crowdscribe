var querystring = require('querystring');
var md5 = require('./md5');
var sys = require('sys');
var service = require('./service');
var database = require('./db');

var SALT = '15f19e6d2c497ab70ff283964093eb52';
//players online
var players_online_by_id = {};
var players_online_by_session = {};
var players_online_by_email = {};
var players_online_by_username = {};

this.create = function(name, password, email) {
	var response = null;
	var player = null;
    if(!is_email_valid(params.email))
        response = service.fail(service.INVALID_EMAIL, 'Invalid email.');
    else if(!is_password_valid(params.password))
        response = service.fail(service.INVALID_PASSWORD, 'Invalid password.');
    else if(is_email_taken(params.email))
        response = service.fail(service.EMAIL_TAKEN, 'That email is taken.');
    else {
		player = Player({name:name, password:password, email:email, fb_id:null});
		if(player.save()) {
			response = service.success(player.player());
		}
	}
    
	return {player: player, response: response};
}

function find_by_email(email, callback) {
	var player = players_online_by_email[email];
	if(player) callback(player);
	else {
		database.query('select * from users u where u.email = ' + email, function(rows) {
			sys.puts("row: " + sys.inspect(r));
		});
	}
}

this.find_by_username = function() {
	
}

this.exists = function(email) {
	if(players_online_by_email[email] /* || find_by_email(email)*/)
		return true;
	else
		return false;
}

this.authenticate = function(cookie) {
	if(!cookie) return null;
	cookie = cookie.replace('; ', ';');
	var login = querystring.parse(cookie, ';', '=')['login'];
	
	if(login) {
		login = JSON.parse(login);
	}
	
	if(login.session) return players_online_by_session[login.session];
	else return false;
}

this.login = function(email, password) {
	//will validate name and look up the database to find player that name and password matches.
	
	var player = players_online_by_email[email];
	if(player && player.password() == password) return player;
	else {
		
		/*var player = find_by_email(email);
		if(player.password() == password) {
			set_status_online(player);
			return player;
		}*/
		return false;
	}
	return false;
}

this.facebook_login = function(fbCookie) {
	//will validate facebook cookie and look up the database for facebook id. 
}

//private methods
function is_email_taken(email) {
	if(players_online_by_email[email] /* || find_by_email(email)*/)
		return true;
	else
		return false;
}

function set_status_online(player) {
	//will put this player into the online list.
	players_online_by_id[player.id()] = player;
	players_online_by_session[player.session()] = player;
	players_online_by_email[player.email()] = player;
	player.update_activity();
}

function set_status_offline(player) {
	//will save player in the db and remover it from online list and perform any other cleanup task needed.
}


function is_player_name_valid(username) {
	return /^[A-Za-z0-9\_\-]+$/.test(username);
}
function is_email_valid(email) {
	return /^[a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
}
function is_password_valid(password) { return true; }

//================================================
// Player Model
//================================================
function Player(o) {
	var properties = {
		id: null,
		name: o.name || null,
		email: o.email || null,
		facebook_id: o.fb_id || null,
		password: o.password || '',
		score: 0
	};
	
	var _interface = {
		id: id, //gets id
		name: name,//get/set name
		email: email,//get set email
		facebook_id: '', //get facebook id
		password: password,
		save: save, //saves user data in the db
		score: score, //get score
		add_score: add_score, //adds to total score
		rooms: '', //gets array of game room ids that thisplayer is playing on.
		last_activity: last_activity, //gets the last activity timestamp in miliseconds
		update_activity: update_activity, //resets the activity timer
		is_active: is_active, // checks if this player has made a move for 5 min.
		public_info: public_info,
		private_info: private_info,
		session: session,//get session key
		set_offline: set_offline//deletes the session key
	};

	var last_timer_update = null;
	var session_key = md5.hash(password() + SALT + (new Date()).getTime());
	update_activity();
	
	function id() { return properties.id; }
	function name(n) { if(n) properties.name = n; return properties.name; }
	function email(e) { if(e) properties.email = e; return properties.email; }
	function facebook_id() { return properties.facebook_id; }
	function score() { return properties.score; }
	function password() { return properties.password; }
	function add_score(scr) { properties.score += scr; };
	
	function last_activity() { return (new Date() - last_timer_update); }
	function update_activity() { last_timer_update = new Date(); }
	function is_active() { return last_activity() < (5).minutes(); }
	
	function save() {
		properties.id = (new Date().getTime()).toString();
		return true;
	}
	
	function public_info() {
		return {
			id: id(),
			name: name(),
			facebook_id: facebook_id(),
			score: score()
		};
	}
	
	function private_info() {
		var info = public_info();
		info['email'] = email();
		return info;
	}
	
	function session() { return session_key; }
	function set_offline() { session_key = null; }
	
	//player interface. all properties are functions

	return _interface;
}


