var mongoose = require('mongoose'),
 	SentimentResult = require('./sentimentResult'),
    handleSentiment = require('./handleSentiment'),
	db = require('./dbConnection');

module.exports = function(callback) {
	SentimentResult.find(function(err, sentimentResults) {
		if(err) {
			console.log(err);
		}else {
			callback(sentimentResults);
		}
	});
}