(function() {
    CS.namespace('story');

    $(document).ready(function(){
		$('.story form').submit(function() {
			CS.story.create($(this).serialize(), function(response) {
			    location.href = '/story.html?id=' + response;
			})
			return false;
		});
		
		CS.story.list(function(response) {
			for (story in response) {
				$('.story table tbody').append($('<tr></tr>')
					.append($('<td></td>').text(response[story].start_text))
					.append($('<td></td>').text(response[story].author.name))
					.append($('<td></td>').text(response[story].state))
					.append($('<td></td>').text(''))
					.append($('<td></td>').text(''))
					.append($('<td></td>').html('<a href="/story.html?id='+ response[story].id +'">Join!</a>'))
				);
			}
		});
    });

    /**
     * Creates Story
     */
    CS.story.create = function(data, callback) {
        $.get('/story/create', data,
            function(response) {
                if(typeof response == 'string')
                    response = JSON.parse(response);
                callback(response.id);
            }
        );
    }
    
    /**
     * Loads Story
     */
    CS.story.load = function() {
        
    }

    /**
     * Joins Current User To Story
     */
    CS.story.join = function() {
        
    }

    /**
     * Validates Story
     */
    CS.story.validate = function() {
        
    }
    
    /**
     * Lists Available Stories
     */
    CS.story.list = function(callback) {
        $.get('/stories', function(response) {
            if (typeof response == 'string') response = JSON.parse(response);
            callback(response);
        })
    }
    
})();