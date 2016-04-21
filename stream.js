//var app = require('express')();
var mongoose = require('mongoose'),
	sentimentAnalysis = require('./sentimentAnalysis'),
	Tweet = require('./tweet'),
	twit = require('twit'),
	db = require('./dbConnection');

var T = new twit({
  consumer_key: 'EjD5szWLFFi9EBuBsKC1Nk7nZ',
  consumer_secret: 'm8fAlmjbiTNrJr4SRhF6dRQ4lMm7dwLDUYZDhENvRfgfRCbwXt',
  access_token: '4330637008-OZnbsNyaf2PgPM9VYzm1ehJ1rVTSxEafO34tvyr',
  access_token_secret: 'waz9W378CeLg2k9HeV4MsM3hmAUYZe6ycIrq739pp7GjK',
  timeout_ms: 	60*1000,
});

module.exports = function(callback) {
	var TrumpStream = T.stream('statuses/filter', { track: 'Donald Trump' }),
		HillaryStream = T.stream('statuses/filter', {track: 'Hillary Clinton'}),
		CruzStream = T.stream('statuses/filter', {track: 'Ted Cruz'}),
		SandersStream = T.stream('statuses/filter', {track: 'Bernie Sanders'});
		
	TrumpStream.on('tweet', function(tweet) {
		handleTweet(tweet, "Donald Trump", function(data) {
			console.log(data);
			callback(data);
		});
	});
	HillaryStream.on('tweet', function(tweet) {
		handleTweet(tweet, "Hillary Clinton", function(data) {
			console.log(data);
			callback(data);
		});
		//socket.emit("Hillary Clinton", HCtweet);
	});
	CruzStream.on('tweet', function(tweet) {
		handleTweet(tweet, "Ted Cruz", function(data) {
			console.log(data);
			callback(data);
		});
		//socket.emit("Ted Cruz", TCtweet);
	});
	SandersStream.on('tweet', function(tweet) {
		handleTweet(tweet, "Bernie Sanders", function(data) {
			console.log(data);
			callback(data);
		});
		//socket.emit("Bernie Sanders", BStweet);
	});
	function handleTweet(tweet, candidate, callback) {
		if(tweet.place != null && tweet.place.country_code == 'US' && (tweet.place.place_type == "city" || tweet.place.place_type == "admin")) {
			var placeCoordinate = tweet.place.bounding_box.coordinates.toString().split(",");
			var lat = placeCoordinate[1];
			var lng = placeCoordinate[0];
			var coordinates = lat.toString() + "," + lng.toString();
			var time = changeTimeFormat(tweet.created_at);
			console.log(time);
			//sentiment analysis
			var tweetsentiment = sentimentAnalysis(tweet.text);
			if(tweetsentiment.score == 0) {
				tweetsentiment.score = 1;
			}
			if(tweet.is_quote_status) {
				var newTweet = new Tweet({
					id_str: tweet.id_str,
					candidates: candidate,
					created_at: time,
					text: tweet.text.toString(),
					is_quote_status: true,
					quoted_text: tweet.quoted_status.text.toString(),
					lang: tweet.lang,
					state: getStateName(tweet.place.place_type,tweet.place.full_name),
					coordinates: coordinates,
					sentiment: {
						score: tweetsentiment.score,
						comparative: tweetsentiment.comparative,
						tokens: tweetsentiment.tokens,
						words: tweetsentiment.words,
						positive: tweetsentiment.positive,
						negative: tweetsentiment.negative
					}
				});
			}else {
				var newTweet = new Tweet({
					id_str: tweet.id_str,
					candidates: candidate,
					created_at: time,
					text: tweet.text.toString(),
					is_quote_status: false,
					quoted_text: "",
					lang: tweet.lang,
					state: getStateName(tweet.place.place_type,tweet.place.full_name),
					coordinates: coordinates,
					sentiment: {
						score: tweetsentiment.score,
						comparative: tweetsentiment.comparative,
						tokens: tweetsentiment.tokens,
						words: tweetsentiment.words,
						positive: tweetsentiment.positive,
						negative: tweetsentiment.negative
					}
				});
			}
			
			//-96.803319,33.137357,-96.803319,33.251946,-96.595889,33.251946,-96.595889,33.137357
			newTweet.save(function(err, newTweet) {
				if(err) return console.error(err);
				//console.log(newTweet);
			});
			callback(newTweet);
		}
	}

	function changeTimeFormat(time) {
		var date = new Date(time);
		var dateFormat = (date.getMonth() + 1 ) + "-" + date.getDate() + "-" + date.getFullYear();
		return dateFormat;
	}

	function getStateName(place_type, full_name) {
		if(place_type == "admin") {
			var stateName = full_name.split(",");
			return stateName[0];
		}else {
			var stateName = full_name.split(",");
			switch(stateName[1].trim()) {
				case "AL": return "Alabama";
				case "AK": return "Alaska";
				case "AZ": return "Arizona";
				case "AR": return "Arkansas";
				case "CA": return "California";
				case "CO": return "Colorado";
				case "CT": return "Connecticut";
				case "DE": return "Delaware";
				case "FL": return "Florida";
				case "GA": return "Georgia";
				case "HI": return "Hawaii";
				case "ID": return "Idaho";
				case "IL": return "Illinois";
				case "IN": return "Indiana";
				case "IA": return "Iowa";
				case "KS": return "Kansas";
				case "KY": return "Kentucky";
				case "LA": return "Louisiana";
				case "ME": return "Maine";
				case "MD": return "Maryland";
				case "MA": return "Massachusetts";
				case "MI": return "Michigan";
				case "MN": return "Minnesota";
				case "MS": return "Mississippi";
				case "MO": return "Missouri";
				case "MT": return "Montana";
				case "NE": return "Nebraska";
				case "NV": return "Nevada";
				case "NH": return "New Hampshire";
				case "NJ": return "New Jersey";
				case "NM": return "New Mexico";
				case "NY": return "New York";
				case "NC": return "North Carolina";
				case "ND": return "North Dakota";
				case "OH": return "Ohio";
				case "OK": return "Oklahoma";
				case "OR": return "Oregon";
				case "PA": return "Pennsylvania";
				case "RI": return "Rhode Island";
				case "SC": return "South Carolina";
				case "SD": return "South Dakota";
				case "TN": return "Tennessee";
				case "TX": return "Texas";
				case "UT": return "Utah";
				case "VT": return "Vermont";
				case "VA": return "Virginia";
				case "WA": return "Washington";
				case "WV": return "West Virginia";
				case "WI": return "Wisconsin";
				case "WY": return "Wyoming";
			}
		}
	}
}

