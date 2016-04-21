var mongoose = require('mongoose');

var TweetSchema = new mongoose.Schema({
	id_str: String,
	candidates: String,
	created_at: String,
	text: String,
	is_quote_status: Boolean,
	quoted_text: String,
	lang: String,
	state: String,
	coordinates: String,
	sentiment: {
		score: Number,
		comparative: Number,
		tokens: [String],
		words: [String],
		positive: [String],
		negative: [String]
	}
});
module.exports = mongoose.model('tweet', TweetSchema);
