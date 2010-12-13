var sys = require("sys");
this.create = function(story) {
	//will create and save a round.
	var r = Round(story);
	r.save();
	return r;
}


var NOT_STARTED = 'not_started';
var ROUND_OVER = 'round_over';
var AWATING_SUBMITIONS = 'awating_submitions';
var AWATING_VOTES = 'awatings_votes';


this.NOT_STARTED = NOT_STARTED;
this.ROUND_OVER = ROUND_OVER;
this.AWATING_SUBMITIONS = AWATING_SUBMITIONS;
this.AWATING_VOTES = AWATING_VOTES;

var tmp_id = 1;

//private
function Round(_story) {
	var submition_time = (.25).minutes();
	var voting_time = (.25).minutes();

	var _id = tmp_id++; var _story_room = _story; var _state = NOT_STARTED; var _count_down = null;
	var _entries = []; var _winning_entry = null;
	var state_change_callback = null;
	
	var submit_reward = 1;
	var vote_reward = 1;
	var runner_up_reward = 2;
	var winner_reward = 3;
	
	function id() { return _id; }
	function story() { return _story_room; }
	function state() { return _state; };
	function is_over() { return state() == ROUND_OVER; }
	function is_waiting_submitions() { return state() == AWATING_SUBMITIONS; }
	function is_accepting_votes() { return state() == AWATING_VOTES; }
	function has_round_started() { return state() != NOT_STARTED }
	function start() { if(state() == NOT_STARTED) change_state(); }
	function count_down() { return _count_down; }
	function entries() { return _entries; }
	function winning_entry() { return _winning_entry; }
	function on_state_change(callback) { state_change_callback = callback; }
	function set_state(new_state) {
		if(_state != new_state) {
			_state = new_state;
			if((typeof state_change_callback).toLowerCase() == 'function')
				state_change_callback();
		}
	}

	function change_state() {
		switch(state())	{
			case NOT_STARTED:
				set_state(AWATING_SUBMITIONS);
				change_state();
			break;
			case AWATING_SUBMITIONS:
				start_count_down(submition_time, AWATING_VOTES);
			break;
			case AWATING_VOTES:
				//reward players for sumbitting
				reward_submission();
				start_count_down(voting_time, ROUND_OVER);
			break
			case ROUND_OVER:
				//reward players for voting.
				reward_voting();
				
				//reward winning entry;
				reward_winners();
			break
		}
	}

	/**
	 * Initiates an interval of 1 second and sets the round state to after_state
	 * when timer runs out
	 *
	 * @param timer {number} The wait time in miliseconds to change the state
	 * @param after_state {string} The state at which the round will be set to after the timer runs out.
	 */
	function start_count_down(timer, after_state) {
		_count_down = timer;
		var then = new Date();
		var seed = setInterval(function() {
			var now = new Date();
			_count_down -= (now - then);
			then = now;
			if(count_down() <= 0) {
				clearInterval(seed);
				set_state(after_state);
				change_state();
			}

		}, (1).second());
	}

	function submit_entry(entry) {
		if(state() != AWATING_SUBMITIONS || is_entry_duplicate(entry)) return false;
		
		_entries.push(entry);
		return true;
	}
	
	function reward_submission() {
		for(var i = 0; i < _entries.length; i++)
			_entries[i].player().add_score(submit_reward);
	}
	
	function reward_voting() {
		for(var i = 0; i < _entries.length; i++)
			_entries[i].reward_voters(vote_reward);
	}
	
	function reward_winners() {
		var most_voted = get_most_voted_entries();
				
		if(most_voted.winner)
			most_voted.winner.player().add_score(winner_reward);
		
		var runner_ups = most_voted.runner_up;
		for(var i = 0; i < runner_ups.length; i++)
			runner_ups[i].player().add_score(runner_up_reward);
	}

	function is_entry_duplicate(entry) {
		for(var i = 0; i < _entries.length; i++)
			if(entry.player() == _entries[i].player()) return true;
		return false;	
	}

	function find_entry_by_id(id) {
		for(var i = 0; i < _entries.length; i++)
			if(id == _entries[i].id()) return _entries[i];
		return null;
	}

	function vote_entry(entry_id, player) {
		var entry = find_entry_by_id(entry_id);
		if(!entry) return false;
		
		return entry.add_vote(player) > 0;
	}
	
	/**
	 * Determins the winning entry and the runner up(s)
	 * If there is more than 1 winner, a winner will be picked at random and the
	 * rest of the entries will be considered as runner ups
	 * @returns {object} An object with the winner and the runner ups entries {winner: entry, runner_up: []}
	 */
	function get_most_voted_entries() {
		var entries_by_score = {};
		var winner_score = 0;
		var runner_up_score;
		var entry, entry_vote_count;
		for(var i = 0; i < _entries.length; i++) {
			entry = _entries[i];
			entry_vote_count = entry.vote_count();
			
			if(!entries_by_score[entry_vote_count])
				entries_by_score[entry_vote_count] = [];
			
			entries_by_score[entry_vote_count].push(entry);
			
			if(entry_vote_count > winner_score) {
				runner_up_score = winner_score;
				winner_score = entry_vote_count;
			}
		}
		var winner_entries = entries_by_score[winner_score] || [];
		var winner_rand_index = Math.floor(Math.random() * winner_entries.length);
		//_winning_entry = high_voted_entry[index];
		
		var winner = winner_entries.splice(winner_rand_index, 1);
		if(winner.length) winner = winner[0];
		else winner = null;
		
		var runner_up = [];
		if(winner_entries.length)
			runner_up = winner_entries;
		else if(entries_by_score[runner_up_score])
			runner_up = entries_by_score[runner_up_score];
			
		return {
			winner: winner,
			runner_up: runner_up
		};
	}
	
	function info() {
		var round_info = {
			id: id(),
			count_down: count_down(),
			state: state(),
			entries: entries_info()
		};
		
		return round_info;
	}
	
	function entries_info() {
		if(state() == AWATING_VOTES || state() == ROUND_OVER) {
			var current_entries = entries();
			var all_entries = [];
			
			for(var i = 0; i < current_entries.length; i++)
				all_entries.push(current_entries[i].info());
			
			return all_entries;
		} else {
			return [];
		}
	}
	
	function save() { return true; }
	
	//all properties are functions
	return {
		id: id,
		story: story, //gets the room this round belongs
		state: state, //gets the state of the round: 'not_started', 'is_over', 'awating_submitions', 'awatings_votes'
		is_over: is_over, //indicates if this round is over
		has_started: has_round_started,
		on_state_change: on_state_change, //registers 1 callbck fn to be notified whenever round changes state
		cout_down: count_down, //gets the count down timer for each applicable state. For 'not_started', 'is_over' this field is not relevant. For 'awating_submitions' and 'awatings_votes' this field rapresents the count down time in miliseconds.
		start: start, //starts the round
		entries: entries, //the array of submited entries.
		winning_entry: winning_entry, //gets the most voted entry.
		submit_entry: submit_entry,// adds an entry to this round. entry will be added to the list only if there is no other entry with the same player and state of the round is 'awating_submitions'
		vote_entry: vote_entry,//adds a vote to an entry.
		save: save,
		info: info,// returns object with round properties
		is_waiting_submitions: is_waiting_submitions,
		is_accepting_votes: is_accepting_votes
	}
}
