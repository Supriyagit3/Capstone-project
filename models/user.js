var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var schema = mongoose.Schema;

var userSchema = new schema({
	name: String,
	email: String,
	username: String,
	password: String,
	OauthId: String,
    OauthToken: String,
	address: String,
	mobileNo: String,
	accountNo: String,
	profilePicture: String
});

//Instance method
userSchema.methods.getName = function() {
    return (this.username);
};

userSchema.plugin(passportLocalMongoose);

var Users = mongoose.model('User', userSchema);

module.exports = Users;