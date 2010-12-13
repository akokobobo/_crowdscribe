$(document).ready(function(){
   var template_str = '<tr>' +
                '<td>#start_text</td>' +
                '<td>#num_players/#max_players</td>' +
                '<td><a href="/story/#id/join">Join/View</a></td>' +
            '</tr>';
            
    $.get(
        '/stories/online',
        function(response) {
            if(response == 'you cant have it')
                response = [];
            else if(typeof response == 'string')
                response = JSON.parse(response);
            populaterGrid(response);
        }
    );
    
    function populaterGrid(stories) {
        var body = $('table.browse tbody');
        console.info("hi");
        for(var i = 0; i < stories.length; i++) {
            var story = stories[i];
            var t = template_str;
            for(var p in story) {
                t = t.replace('#' + p, story[p], 'g');
                body.append($(t));
            }
        }
    }
});