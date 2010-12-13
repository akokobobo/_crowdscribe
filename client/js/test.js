$(document).ready(function(){
    
    $('button#create').click(create_one);
    $('button#join').click(join_one);
    
    function create_one(){
        register(
            function() {
                create_room(
                    function(room_id) {
                        join_room(room_id, function() {
                            setup_submit_click(room_id);
                            setStatusInterval(room_id);
                        });
                    }
                )
            }
        );
    }
    
    function join_one(){
        register(
            function() {
                find_room(
                    function(room_id) {
                        join_room(room_id, function() {
                            setup_submit_click(room_id);
                            setStatusInterval(room_id);
                        });
                    }
                )
            }
        );
    }
    
    function register(callback) {
        $.get(
            '/player/register',
            {name: 'adrian'+parseInt(Math.random()*10000), password: '123', email: 'adi@s.com'},
            callback
        );
    }
    
    function create_room(callback) {
        $.get(
            '/story/create',
            {name: 'hello', max_players: 9},
            function(response) {
                if(typeof response == 'string')
                    response = JSON.parse(response);
                callback(response.id);
            }
        );
    }
    
    function find_room(callback) {
        $.get(
            '/stories',
            function(response) {
                if(typeof response == 'string')
                    response = JSON.parse(response);
                callback(response[0].id);
            }
        );
    }
    
    function join_room(room_id, callback) {
        $.get(
            '/story/' + room_id + '/join',
            callback
        );
    }
    
    function setStatusInterval(room_id) {
        setInterval(function() {
            $.get(
                '/story/' + room_id,
                function(response) {
                    if(typeof response == 'string')
                        response =  JSON.parse(response);
                        
                    $('#status').html(JSON.stringify(response));
                    if(response.state == 'round in progress') {
                        if(response.round.state == 'awatings_votes') {
                            display_entries(response.id, response.round.entries);
                        }
                    }
                }
            );
        }, 1000);
    }
    
    function display_entries(room_id, entries) {
        //console.info(entries);
        var container = $('#entries');
        var template = container.find('.template');
        container.find('.entry').remove();
        
        for(var i = 0; i < entries.length; i++) {
            var entry = template.clone();
            entry.removeClass('template').addClass('entry');
            entry.find('.txt').html(entries[i].text);
            
            entry.find('.vote').click(
                (function(room_id, id){
                    return function (){
                        vote_entry(room_id, id, function(){});
                    }
                })(room_id, entries[i].id)
            );
            
            entry.appendTo(container);
        }
    }
    
    function setup_submit_click(room_id) {
        $('#submit-entry').click(function(){
            submit_entry(room_id, $('#entry').val(), function() {
                $('#entry').val('');
            });
        });
    }
    
    function submit_entry(room_id, entry, callback) {
        $.get(
          '/story/' + room_id + '/submit_entry',
          {entry: entry},
          callback
        );
    }
    
    function vote_entry(room_id, entry_id, callback) {
        $.get(
          '/story/' + room_id + '/vote_entry',
          {entry_id: entry_id},
          callback
        );
    }
    
});