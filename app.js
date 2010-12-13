var sys = require('sys');
require('./server/overloads');
var md5 = require('./server/md5');

var Player = require('./server/player');
var Story = require('./server/story');

var express = require('express');
var app = express.createServer();
var connect = require('connect');


app.configure(function() {
   app.use(connect.staticProvider(__dirname + '/client'));
});

// home page
/*app.get('/', function(req, res) {
    sys.log('Ding!');
    var file = '../client/index.html';
    res.sendfile(file);
});*/

// story creation page
app.get('/story/create', function(req, res) {
    var auth_cookie = req.headers.cookie || '';
    var params = req.query;
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.create(player, params.sentence, params.title, params.max_players);
        if(story) {
            res.send(JSON.stringify(story.info()));
        } else res.send('could not create');
    } else res.send('you cant have it');
});

// story page
app.get('/story/:id', function(req, res, p) {
    var auth_cookie = req.headers.cookie || '';
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.find(req.params.id);
        if(story) {
            res.send(JSON.stringify(story.info()));
        } else res.send('not found');
    } else res.send('you cant have it');
});

app.get('/story/:id/join', function(req, res, params) {
    var auth_cookie = req.headers.cookie || '';
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.find(req.params.id);
        if(story) {
            res.send(story.join(player).toString());
        } else res.send('not found');
    } else res.send('you cant have it');
});

app.get('/story/:id/round', function(req, res) {
    var auth_cookie = req.headers.cookie || '';
    var params = req.query;
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.find(params.id);
        if(story) {
            var active_round = story.active_round();
            if(active_round) {
                res.send(active_round.info());
            } else res.send('not found');
        } else res.send('not found');
    } else res.send('you cant have it');
});

app.get('/story/:id/submit_entry', function(req, res) {
    var auth_cookie = req.headers.cookie || '';
    var params = req.query;
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.find(req.params.id);
        if(story) {
            res.send(story.submit_entry(player, params.entry).toString());
        } else res.send('not found');
    } else res.send('you cant have it');
});

app.get('/story/:id/vote_entry', function(req, res) {
    var auth_cookie = req.headers.cookie || '';
    var params = req.query;
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var story = Story.find(req.params.id);
        if(story) {
            res.send(story.vote_entry(player, params.entry_id).toString());
        } else res.send('not found');
    } else res.send('you cant have it');
});

app.get('/stories', function(req, res, params) {
    var auth_cookie = req.headers.cookie || '';
    
    var player = Player.authenticate(auth_cookie);
    
    if(player != false) {
        res.send(Story.online());
    } else res.send('you cant have it');
});

app.get('/player/login', function(req, res, params) {
    var logged_in = Player.login(req.query.email, req.query.password);
    
    //set auth cookie
    if(logged_in) {
        writeCookie(res, logged_in);
        res.end("true");
    } else res.send("false");
});

app.get('/player/register', function(req, res) {
    var params = req.query;
    var created = false;
    if(!Player.exists(params.email))
        created = Player.create(params.username, params.password, params.email, params.facebook_id || '');
    
    //set auth cookie
    if(created) {
        writeCookie(res, created);
        res.end("true");
    } else res.send("false");
});

function writeCookie(res, player) {
    var cookie = 'login=';
    cookie += (JSON.stringify({id: player.id() , session: player.session()}) + ';expires=2 Aug 2400 20:47:11 UTC; path=/');
    sys.log(cookie);
    res.writeHead(200, {"Set-Cookie": cookie});
}

app.get('/player/info', function(req, res, params) {
    //get the auth cookie
    var auth_cookie = req.headers.cookie || '';
    
    var player = Player.authenticate(auth_cookie);
    if(player) res.send(player.private_info());
    else res.end('you cant have it');
});

app.get('/player/:id/info', function(req, res, params) {
    var auth_cookie = req.headers.cookie || '';
    
    var player = Player.authenticate(auth_cookie);
    if(player) {
        var requested_player = Player.find(params.id);
        if(requested_player)
            res.end(player.public_info());
        else res.end('you cant have it');
    } else res.end('you cant have it');
});


sys.log("Starting server on port 8000.");
app.listen(3000);
