var sys = require("sys");
this.create = function(text, player) {
	//creates an entry with the player id as originator.
	var e = Entry(text, player);
	if(e.save()) return e;
	
	return null;
}

//private methods
function Entry(_text, posted_by_player) {
	var _player = posted_by_player;
	var _id = new Date().getTime(); var _vote_list = [];

	function id() { return _id; }
	function text() { return _text; }
	function player() { return _player; }
	function save() { return true; }
	
	function add_vote(player_voted) {
		if(!player_voted) return false;
		
		if(player_voted != player() && !in_voted_list(player_voted))
			return _vote_list.push(player_voted);
		return false;
	}

	function in_voted_list(p /*player*/) {
		for(var i = 0; i < _vote_list.length; i++)
			if(_vote_list[i] == p) return true;
		return false;
	}

	function reward_voters(score) {
		for(var i = 0; i < _vote_list.length; i++)
			_vote_list[i].add_score(score);
	}

	function vote_count() { return _vote_list.length; }
	
	function info() {
		return {
			id: id(),
			text: text(),
			vote_count: vote_count(),
			player_id: player().id()
		};
	}
	

	//all properties are functions
	return {
		id: id, //entry id
		text: text, //gets entry's text
		player: player, //gets the player which generated this entry.
		//round:'' //(optional for easy look up) gets the round that this entry was originated.
		save: save, //saves this entry in the db
		add_vote: add_vote,//records players that voted for this post. player cannot be the creator or in the list of voters.
		vote_count: vote_count, //gets number of votes this entry has recieved
		reward_voters: reward_voters, //rewards all players which voted for this entry
		score_value: '', //gets the value of this entry
		info: info
	}
}
