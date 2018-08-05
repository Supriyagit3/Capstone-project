var mongoose = require('mongoose');

var schema = mongoose.Schema;

var typeSchema = new schema({
	name: {
		type: String,
		required: true
	}
});

var Types = mongoose.model('Type', typeSchema);

module.exports = Types;