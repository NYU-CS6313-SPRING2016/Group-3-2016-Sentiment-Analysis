var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var stream = require('./stream');
var historyTweets = require('./historicalTweet');
var historySentimentResult = require('./historicalSentimentResult');
app.set('port', process.env.PORT || '3000');
server.listen(app.get('port'), function() {
    
    console.log("listening on port "+ app.get("port"));
});

app.get('/sentimentresult', function(req, res) {
	historySentimentResult(function(data){
		res.json(data);
	});
});

app.use(express.static(__dirname + '/public'));
io.on('connection', function(socket) {
	console.log("socket connection is on");
	stream(function(data) {
        console.log("streaming");
		socket.emit('tweet', data);
	});
});

/*app.get('/stream', function(req, res) {
	stream(function(data) {
		res.json(data);
	});
});*/
app.get('/history', function(req, res) {
	historyTweets(function(data) {
		res.json(data);
	});
});
