var mongoose = require('mongoose'),
	Tweet = require('./tweet'),
	SentimentResult = require('./sentimentResult'),
	db = require('./dbConnection');

var states = [
{ "stateName":"Alabama", "coordinates":[-86.766233,33.001471]}, 
{ "stateName":"Alaska", "coordinates":[-148.716968,61.288254]}, 
{ "stateName":"Arizona", "coordinates":[-111.828711,33.373506]}, 
{ "stateName":"Arkansas", "coordinates":[-92.576816,35.080251]}, 
{ "stateName":"California", "coordinates":[-119.355165,35.458606]}, 
{ "stateName":"Colorado", "coordinates":[-105.203628,39.500656]}, 
{ "stateName":"Connecticut", "coordinates":[-72.874365,41.494852]}, 
{ "stateName":"Delaware", "coordinates":[-75.561908,39.397164]}, 
{ "stateName":"Florida", "coordinates":[-81.634622,27.795850]}, 
{ "stateName":"Georgia", "coordinates":[-83.868887,33.332208]}, 
{ "stateName":"Hawaii", "coordinates":[-157.524452,21.146768]}, 
{ "stateName":"Idaho", "coordinates":[-115.133222,44.242605]}, 
{ "stateName":"Illinois", "coordinates":[-88.380238,41.278216]}, 
{ "stateName":"Indiana", "coordinates":[-86.261515,40.163935]}, 
{ "stateName":"Iowa", "coordinates":[-93.049161,41.960392]}, 
{ "stateName":"Kansas", "coordinates":[-96.536052,38.454303]}, 
{ "stateName":"Kentucky", "coordinates":[-85.241819,37.808159]}, 
{ "stateName":"Louisiana", "coordinates":[-91.457133,30.699270]}, 
{ "stateName":"Maine", "coordinates":[-69.719931,44.313614]}, 
{ "stateName":"Maryland", "coordinates":[-76.797396,39.145653]}, 
{ "stateName":"Massachusetts", "coordinates":[-71.363628,42.271831]}, 
{ "stateName":"Michigan", "coordinates":[-84.170753,42.866412]}, 
{ "stateName":"Minnesota", "coordinates":[-93.583003,45.210782]}, 
{ "stateName":"Mississippi", "coordinates":[-89.593164,32.566420]}, 
{ "stateName":"Missouri", "coordinates":[-92.153770,38.437715]}, 
{ "stateName":"Montana", "coordinates":[-111.209708,46.813302]}, 
{ "stateName":"Nebraska", "coordinates":[-97.403875,41.183753]}, 
{ "stateName":"Nevada", "coordinates":[-116.304648,37.165965]}, 
{ "stateName":"New Hampshire", "coordinates":[-71.463342,43.153046]}, 
{ "stateName":"New Jersey", "coordinates":[-74.428055,40.438458]}, 
{ "stateName":"New Mexico", "coordinates":[-106.342108,34.623012]}, 
{ "stateName":"New York","coordinates":[-74.645228,41.507548]}, 
{ "stateName":"North Carolina", "coordinates":[-79.667654,35.553334]}, 
{ "stateName":"North Dakota", "coordinates":[-99.334736,47.375168]}, 
{ "stateName":"Ohio", "coordinates":[-82.749366,40.480854]}, 
{ "stateName":"Oklahoma", "coordinates":[-96.834653,35.597940]}, 
{ "stateName":"Oregon", "coordinates":[-122.579524,44.732273]}, 
{ "stateName":"Pennsylvania", "coordinates":[-77.075925,40.463528]}, 
{ "stateName":"Rhode Island", "coordinates":[-71.448902,41.753318]}, 
{ "stateName":"South Carolina", "coordinates":[-81.032387,34.034551]}, 
{ "stateName":"South Dakota", "coordinates":[-99.043799,44.047502]}, 
{ "stateName":"Tennessee", "coordinates":[-86.397772,35.795862]}, 
{ "stateName":"Texas", "coordinates":[-97.388631,30.943149]}, 
{ "stateName":"Utah", "coordinates":[-111.900160,40.438987]}, 
{ "stateName":"Vermont", "coordinates":[-72.814309,44.081127]}, 
{ "stateName":"Virginia", "coordinates":[-77.835857,37.750345]}, 
{ "stateName":"Washington", "coordinates":[-121.624501,47.341728]}, 
{ "stateName":"West Virginia", "coordinates":[-80.820221,38.767195]}, 
{ "stateName":"Wisconsin", "coordinates":[-89.001006,43.728544]}, 
{ "stateName":"Wyoming", "coordinates":[-107.008835,42.675762]}
];

var candidates = ["Donald Trump", "Hillary Clinton", "Ted Cruz", "Bernie Sanders"];
for(var i = 0; i < states.length; i ++) {
	for(var j = 0; j < candidates.length; j ++) {
		getTweetsOfStateOfCandidate(states[i].stateName, candidates[j], function(data) {
			if(data) {
				handleSentimentScore(data);
			}
		});
	}
}

function getTweetsOfStateOfCandidate(stateName, candidateName, callback) {
	Tweet.find({state : stateName, candidates : candidateName}).
		exec(function(err, tweets) {
			//console.log(stateName + ": " + candidateName);
			if (err) {
					return handleError(err);
			}else if(tweets.length == 0){
				callback(null);
				//console.log("No Tweets");
			}else {
				callback(tweets);
			}
		});	

}

function handleSentimentScore(tweets) {
	var positiveAvgScore = 0,
		negativeAvgScore = 0,
		amount,
		positiveAmount = 0,
		negativeAmount = 0,
		curCoordinates;
	amount = tweets.length;
	for(var tweetNum = 0; tweetNum < tweets.length; tweetNum ++) {
		if(tweets[tweetNum].sentiment.score > 0) {
			positiveAvgScore += tweets[tweetNum].sentiment.score;
			positiveAmount ++;
		}else if(tweets[tweetNum].sentiment.score < 0) {
			negativeAvgScore += tweets[tweetNum].sentiment.score;
			negativeAmount ++;
		}
	} 
	for(var i = 0; i < states.length; i ++) { 
		if(states[i].stateName == tweets[0].state) {
			curCoordinates = states[i].coordinates;
			break;
		}	
	}
	if(negativeAmount == 0) {
		negativeAvgScore = 0;
	}else {
		negativeAvgScore /= negativeAmount;
	}
	if(positiveAmount == 0) {
		positiveAvgScore = 0;
	}else {
		positiveAvgScore /= positiveAmount;
	}
	if(positiveAmount + negativeAmount != amount) {
		console.log(tweets[0].state+ tweets[0].candidates);
		console.log("The computation is wrong");
	}else {
		SentimentResult.findOne({state : tweets[0].state, candidates : tweets[0].candidates},
			function(err, result) {
				if (err) {
					return handleError(err);
				}else if(result == null) {
					var sentimentResult = new SentimentResult({
							state: tweets[0].state,
							coordinates: curCoordinates,
							candidates: tweets[0].candidates,
							positiveAvgScore: positiveAvgScore,
							negativeAvgScore: negativeAvgScore,
							amount: amount,
							positivePercent: positiveAmount / amount, 
							negativePercent: negativeAmount / amount
					});
					
					sentimentResult.save(function(err, sentimentResult) {
						if (err) return handleError(err);
					});
					//console.log(sentimentResult);
				}else {
					result.positiveAvgScore = positiveAvgScore;
					result.negativeAvgScore = negativeAvgScore;
					result.amount = amount;
					result.positivePercent = positiveAmount / amount;
					result.negativePercent = negativeAmount / amount;
					result.save(function(err) {
						if (err) return handleError(err);
					});
				}
			});
	}
}

