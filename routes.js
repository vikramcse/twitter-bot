var JSX = require('node-jsx').install();
var Tweet = require('./models/Tweet');
React = require('react'),

module.exports = {
	index: function (req, res) {
		Tweet.getTweets(0, 0, function(tweets, pages) {
			
		});
	}
};