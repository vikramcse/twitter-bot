var JSX = require('node-jsx').install();
var Tweet = require('./models/Tweet');
var TweetsApp = require('./components/TweetsApp.react');
var React = require('react');

module.exports = {
	index: function (req, res) {
		Tweet.getTweets(0, 0, function(tweets, pages) {
			var markup = React.renderComponentToString(
		        TweetsApp({
		          tweets: tweets
		        })
		    );

			res.render('home', {
				markup: markup,
				state: JSON.stringify(tweets) // Pass current state to client side
			});
		});
	}
};