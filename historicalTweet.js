var mongoose = require('mongoose');
var Tweet = require('./tweet');
var db = require('./dbConnection');

module.exports = function(callback) {
	Tweet.find(function(err, tweets) {
		if(err) {
			console.log(err);
		}else {
			callback(tweets);
		}
	});	
} 
