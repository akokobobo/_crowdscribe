var sys = require("sys");
var Round = require("./round");
var Entry = require('./entry');
//reference of all active games in the server
var all_stories = {};

//returns basic_info of rooms online;
this.online = function() {
	var stories_online = [];
	for(var id in all_stories) {
		stories_online.push(all_stories[id].basic_info());
	}
	return stories_online;
}

this.find = function(id) {
	return all_stories[id] || null;
}

this.create = function(author, start_text, story_name, max_players) {
	//creates an empty story room, saves it and places it into the game list
	var r = Story(author, start_text, story_name, max_players);
	if(r.save()) {
		all_stories[r.id()] = r;
		return r;
	}
	return null;
}

//story states
var WAITTING_FOR_PLAYERS = 'waitting for players';
var RESES = 'reses';
var STARTING_ROUND = 'starting round';
var ROUND_IN_PROGESS = 'round in progress';
var DEFAULT_STORY_START = 'It was a dark and stormy night...';

function Story(author, start_text, story_name, max_players) {
	//interface;
	var _interface = {
		id: id, //room id
		name: name,
		//players: '', //list of active players
		//created_by: // player who created this room
		active_round: active_round, //the current round object
		story_stream: story_stream, //returns array of winning etries
		join: join,//player joins this room.
		leave: leave,
		save: save,//saves this room on the db
		basic_info: basic_info,
		info: info,
		submit_entry: submit_entry,
		vote_entry: vote_entry
	};
	
	var _creator = author; var _min_players = 2;
	var _max_player = max_players > _min_players ? max_players : _min_players;
	var _max_rounds = 3;
	var _id = new Date().getTime(); var _players = [];
	var _rounds = []; var active_round_index = -1;
	var _start_text = start_text || DEFAULT_STORY_START;
	var _story_stream = []; var _state = WAITTING_FOR_PLAYERS;
	var timer_between_rounds = (10).seconds(); var _round_starting_timer = 0;
	 
	function id() { return _id; }
	function name() { return story_name; }
	function get_start_text() { return _start_text; }
	function players() { return _players; }
	function created_by() { return _creator; }
	//function author_name() { return _author_name; }
	function active_round() {
		return _rounds[_rounds.length - 1] || null;
	}
	function story_stream() { return _story_stream; }
	function round_starting_in(seconds) {
		if((typeof seconds).toLowerCase() == 'number')
			_round_starting_timer = seconds;
		return _round_starting_timer;
	}
	
	function basic_info() {
		return {
			id: id(),
			name: name(),
			start_text: get_start_text(),
			max_players: max_players,
			num_players: players().length,
			state: state(),
			is_over: is_story_over(),
			starting_in: round_starting_in(),
			author: created_by().public_info()
		};
	}
	
	function info() {
		var story_info = basic_info();
		story_info['players'] = players_basic_info();
		story_info['round'] = null;
		var round = active_round();
		if(round && !round.is_over()) { story_info['round'] = round.info(); /*sys.log("got a round: " + JSON.stringify(round.info()));*/  }
		return story_info;
	}
	
	function players_basic_info() {
		var players_info = [];
		var p = players();
		for(var i = 0; i < p.length; i++)
			players_info.push(p[i].public_info());
		return players_info;
	}
	
	function state(new_state) {
		if(new_state)
			_state = new_state;
		return _state
	}
	
	/**
	 * Adds a player to the player's list of this room
	 * attempts to start the next round if possible.
	 *
	 * @param player {object} The player object attempting to join.
	 */
	function join(player) {
		if(!is_player_in_list(player)) {
			_players.push(player);
			continue_story();
			return true;
		}
		return false;
	}
	
	function leave(player) {
		for(var i = 0; i < _players.length; i++)
			if(_players[i] == player) _players.splice(i, 1);
	}
	
	function is_player_in_list(player) {
		for(var i = 0; i < _players.length; i++)
			if(_players[i] == player) return true;
			
		return false;
	}
	
	
	function continue_story() {
		//Don't start the next round if an active round exist and it's not over yet.
		//Or if the game is actually over.
		if(
		   (has_story_started() && !active_round().is_over()) ||
		   is_story_over())
			return false;
		
		
		//begin the next round if enough players
		//and the story is Waiting for players or is in reses(round just ended)
		//
		if(_players.length >= _min_players &&
		   (state() == WAITTING_FOR_PLAYERS || state() == RESES )) {
			begin_round_in(timer_between_rounds);
		}
		
		return true;
	}
	
	function begin_round_in(seconds) {
		var start = new Date().getTime();
		var end;
		var total_time = 0;
		state(STARTING_ROUND);
		
		var round_start = setInterval(function(){
			end = new Date().getTime();
			total_time += (end - start);
			start = end;
			
			if(total_time >= seconds) {
				set_next_round();
				start_next_round();
				clearInterval(round_start);
			} else 		
				round_starting_in(seconds - total_time);
		}, (1).second());
	}
	
	function set_next_round() {
		if(_rounds.length < _max_rounds) {
			sys.log("creating round");
			_rounds.push(Round.create(_interface));
		}
	}
	
	function start_next_round() {
		var round = active_round();
		sys.log("next round..." + (round ? round.has_started() : " ?"));
		if(round && !round.has_started()) {
			sys.log("changing round..." + round.id());
			round.on_state_change(round_state_changed);
			round.start();
			state(ROUND_IN_PROGESS);
		}
	}
	
	function has_story_started() { return _rounds.length > 0; }
	
	/**
	 * Game is over when the last round is over.
	*/
	function is_story_over() {
		return (_max_rounds == _rounds.length &&
			_rounds[_max_rounds - 1].is_over());
	}
	
	function round_state_changed() {
		var round = active_round();
		if(!round) return false;
		
		if(round.is_over()) {
			sys.log("round is over and switching...");
			state(RESES);
			
			var winning_entry = round.winning_entry();
			if(winning_entry)
				_story_stream.push(winning_entry.info());
			
			continue_story();
		}
		
		return false;
	}
	
	function submit_entry(player, entry_text) {
		var round = active_round();
		//to sumbit an entry player must be part of this story
		//state of the round must be in progress
		//and the active round's state must be waiting for submissions
		if(
			is_player_in_list(player) &&
			state() == ROUND_IN_PROGESS &&
			round &&
			round.is_waiting_submitions()
		   ) {
			return round.submit_entry(Entry.create(entry_text, player));
		} else {
			return false;
		}
	}
	
	function vote_entry(player, entry_id) {
		var round = active_round();
		if(
			is_player_in_list(player) &&
			state() == ROUND_IN_PROGESS &&
			round &&
			round.is_accepting_votes()
		   ) {
			return round.vote_entry(entry_id, player);
		} else {
			return false;
		}
	}
	
	function save() { return true; }
	
	(function create_rounds() {
		for(var i = 0; i < _max_rounds; i++) {
			//_rounds.push(Round.create(_interface));
		}
	})();
	
	return _interface;
}

