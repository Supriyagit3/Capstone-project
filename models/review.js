var mongoose = require('mongoose');

var schema = mongoose.Schema;

var reviewSchema = new schema({
	produceId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Produce',
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		min: 0,
		max: 5,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
});

var Reviews = mongoose.model('Review', reviewSchema);

module.exports = Reviews;