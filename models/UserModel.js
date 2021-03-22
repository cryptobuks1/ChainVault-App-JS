var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	remoteAddress: {type: String, required: true},
	level: {type: Boolean, require: true},
	localAddress: {type: String, require: false},
	localPrivateKey: {type: String, require: false},
	transactions: [{type: mongoose.Schema.Types.ObjectId,
					ref: "Transaction"}]
}, {timestamps: true});

// Virtual for user's full name

module.exports = mongoose.model("User", UserSchema);