(function() {
    CS.namespace('story');

    $(document).ready(function(){
        getStory(function(story) { 
            //console.info(story)
            
            //populate so far.
            populateEntries(story);
            
            //setup intervals.
            //if player is not part of the game. start interval to display only round info.
            //otherwise
            //update ui for players that are playing, so that they can submit or vote.
            if(isPlayerInStory(story)) {
                setInterval_PlayerInStory();
            } else {
                setInterval_PlayerIsViewing();
            }
            
            //stop intervals once game is over.
        });
    });
    
    function getParams() {
        var p = location.href.substr(location.href.indexOf('?') + 1, location.href.length);
        p = p.split('&');
        var params = {};
        for(var i = 0; i < p.length; i++) {
            var val = p[i].split('=');
            params[val[0]] = val[1];
        }
        
        return params;
    }
    
    function getStory(callback) {
        CS.story.getData(getParams().id, callback);
    }
    
    function populateEntries(story) {
        var section = $('#story');
        section.find('p').remove();
        section.append('<p>' + story.start_text + '</p>');
        if (!story.entry) return;
        
        for(var i = 0; i < story.entries.length; i++) {
            section.append('<p>' + story.entries[i].text + '</p>');
        }
    }
    
    function isPlayerInStory(story) {
        var p_id = CS.player.id();
        for(var i = 0; i < story.players.length; i++) {
            if(p_id == story.players[i].id) return true;
        }
        return false;
    }
    
    var pollInterval = 1000;
    var intervalSeed;
    var story_state = null;
    
    function setInterval_PlayerInStory() {
        intervalSeed = setTimeout(function() {
            getStory(function(story) {
                $('#current-round').hide();
                if (story_state == null) onFirstJoin();
                else if()
               //if story watting for submittion show the submition area.
               //if story is waitting for entry vote
            });
        }, pollInterval);
    }
    
    function onFirstJoin() {
        
    }
    
    function onStoryStart() {
        
    }
    
    function setInterval_PlayerIsViewing() {
        
    }

    /**
     * Get Story
     */
    CS.story.getData = function(storyId, callback) {
        $.get('/story/' + storyId,
            function(response) {
                if(typeof response == 'string')
                    response = JSON.parse(response);
                callback(response);
            }
        );
    }
    
})();