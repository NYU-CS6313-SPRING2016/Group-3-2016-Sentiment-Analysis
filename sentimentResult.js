var mongoose = require('mongoose');

var sentimentResultSchema = new mongoose.Schema({
	state: String,
	coordinates:[Number],
	candidates: String,
	positiveAvgScore: Number,
	negativeAvgScore: Number,
	amount: Number,
	positivePercent: Number, //percentage of the positive tweet 
	negativePercent: Number	//percentage of the negative tweet
});
module.exports = mongoose.model('sentimentResult', sentimentResultSchema);