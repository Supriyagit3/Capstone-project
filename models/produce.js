var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var currency = mongoose.Types.Currency;

var schema = mongoose.Schema;

var produceSchema = new schema({
	type: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Type',
		required: true
	},
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {						
		type: Number,
		required: true
	},
	qtyAvailable:{
		type: Number,
		requrired: true
	},
	harvestDate: {
		type: Date,
		required: true
	},
	images: {
		type: String
	},
	description: {
		type: String
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}); 

var Produces = mongoose.model('Produce', produceSchema);

module.exports = Produces;