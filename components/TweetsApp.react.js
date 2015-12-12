/** @jsx React.DOM */

var React = require('react');
var Tweets = require('./Tweets.react.js');
var Loader = require('./Loader.react.js');
var NotificationBar = require('./NotificationBar.react.js');

var TweetsApp = React.createClass({
	addTweet: function(tweet) {
		var newTweets = this.state.tweets;

		// Increment the unread count
    	var count = this.state.count + 1;

    	// Increment the skip count
    	var skip = this.state.skip + 1;

    	newTweets.unshift(tweet);

    	 this.setState({tweets: newTweets, count: count, skip: skip});
	},
	// Method to get JSON from server by page
	getPage: function(page) {

		// Setup our ajax request
		var request = new XMLHttpRequest();
		var self = this;
		request.open('GET', 'page/' + page + "/" + this.state.skip, true);
		request.onload = function() {

			// If everything is cool...
			if (request.status >= 200 && request.status < 400) {
				// Load our next page
				self.loadPagedTweets(JSON.parse(request.responseText));
			} else {
				// Set application state (Not paging, paging complete)
				self.setState({paging: false, done: true});
			}
		};

		// Fire!
		request.send();
	},
	// Method to show the unread tweets
	showNewTweets: function() {
		// Get current application state
		var updated = this.state.tweets;

		// Mark our tweets active
		updated.forEach(function(tweet){
			tweet.active = true;
		});

		// Set application state (active tweets + reset unread count)
		this.setState({tweets: updated, count: 0});
	},
	// Method to load tweets fetched from the server
	loadPagedTweets: function(tweets){

		// for closure
		var self = this;

		// If we still have tweets...
		if(tweets.length > 0) {

			// Get current application state
			var updated = this.state.tweets;

			// Push them onto the end of the current tweets array
			tweets.forEach(function(tweet){
				updated.push(tweet);
			});

			// for the loader svg
			setTimeout(function(){
				// Set application state (Not paging, add tweets)
				self.setState({tweets: updated, paging: false});
			}, 1000);

		} else {

			// Set application state (Not paging, paging complete)
			this.setState({done: true, paging: false});
		}
	},
	checkWindowScroll: function() {
		// Method to check if more tweets should be loaded, by scroll position
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    	var s = document.body.scrollTop;
    	var scrolled = (h + s) > document.body.offsetHeight;

    	// If scrolled, not currently paging and not complete...
    	if(scrolled && !this.state.paging && !this.state.done) {
    		this.setState({paging: true, page: this.state.page + 1});
    		this.getPage(this.state.page);
    	}
	},
	componentDidMount: function() {
		// closure to socket.on
		var self = this;

		// io comes from the client side socket.io script
		var socket = io.connect();
		socket.on('tweet', function(data) {
			self.addTweet(data);
		});

		// Attach scroll event to the window for infinity paging
  		window.addEventListener('scroll', this.checkWindowScroll);
	},
	getInitialState: function(props) {
		props = props || this.props;

		return {
			tweets: props.tweets,
			count: 0,
			page: 0,
			paging: false,
			skip: 0,
			done: false
	    };
	},
	componentWillReceiveProps: function(newProps, oldProps) {
		this.setState(this.getInitialState(newProps));
	},
	 render: function() {
		return (
			 <div className="tweets-app">
		        <Tweets tweets={this.state.tweets} />
		        <Loader paging={this.state.paging}/>
		        <NotificationBar count={this.state.count} onShowNewTweets={this.showNewTweets}/>
	      </div>
		)
	}
});

module.exports = TweetsApp;