var mongoose = require("mongoose");

var TokenSchema = new mongoose.Schema({
	name: {type: String, required: true},
	address: {type: String, required: true},
	decimal: {type: Number, required: true}
}, {timestamps: true});

module.exports = mongoose.model("Token", TokenSchema);