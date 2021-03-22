var mongoose = require("mongoose");
const TransactionModel = require("./TransactionModel");

var UserSchema = new mongoose.Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	remoteAddress: {type: String, required: true},
	level: {type: Boolean, require: true},
	localAddress: {type: String, require: false},
	localPrivateKey: {type: String, require: false},
	trades: [{type: mongoose.Schema.Types.ObjectId, ref: "Trade"}],
}, {timestamps: true});

// Virtual for user's full name

exports.UserModel = mongoose.model("User", UserSchema);
