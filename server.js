var express = require('express');
var exphbs = require('express-handlebars');
var http = require('http');
var mongoose = require('mongoose');
var twitter = require('twit');
var routes = require('./routes');
var config = require('./config');
var streamHandler = require('./utils/streamHandler');

var app = express();
var port = process.env.PORT || 7777;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Connect to our mongo database
mongoose.connect('mongodb://localhost/tweets');

// Create a new ntwitter instance
var twit = new twitter(config.twitter);

// Index Route
app.get('/', routes.index);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
var stream =  twit.stream('statuses/filter',{ track: '#DilwaleNewPromo'});
stream.on('tweet', function(data) {
	// new tweet object
    var tweet = {
      twid: data['id'],
      active: false,
      author: data['user']['name'],
      avatar: data['user']['profile_image_url'],
      body: data['text'],
      date: data['created_at'],
      screenname: data['user']['screen_name']
    };

    // create new tweet schema object
    var newTweet = new Tweet(tweet);

    // save the tweet to database
    newTweet.save(function(err) {
    	if (!err) {
    		console.log("saved...");
	        // if no error socket.io emits the tweet.
	        io.emit('tweet', tweet);
	    }
    });
});