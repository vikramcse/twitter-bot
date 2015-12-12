var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	twid: String,
	active: String,
	author: String,
	avatar: String,
	body: String,
	date: Date,
	screenname: String
});

// static getTweets method from db
schema.statics.getTweets = function(page, skip, callback) {
	var tweets = [];
	var start = (page * 10) + (skip * 1);

	Tweet
		.find({}, 'twid active author avatar body date screenname', {skip: start, limit: 10})
		.sort({date: 'desc'})
		.exec(function(err, data) {
			if(!err) {
				tweets = data;
				tweets.forEach(function(tweet) {
					tweet.active = true;
				});
			}

			// Pass them back to the specified callback
    		callback(tweets);
		});
};

module.exports = Tweet = mongoose.model('Tweet', schema);
