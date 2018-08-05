var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var currency = mongoose.Types.Currency;

var schema = mongoose.Schema;

var orderSchema = new schema({
		produceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Produce'
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users'
		},
		quantity: {
			type: Number,
			required: true
		},
		status: {
			type: Number,
			required: true
		},
		orderDate: {
			type: Date,
			required: true
		},
		deliveryDate: {
			type: Date,
		},
		price: {
			type: currency,
			required: true
		},
		deliveryCharges: {
			type: currency,
			required: true
		}
});

var Orders = mongoose.model('Order', orderSchema);
module.exports = Orders;