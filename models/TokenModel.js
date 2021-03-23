var mongoose = require("mongoose");

var TokenSchema = new mongoose.Schema({
	name: {type: String, required: true},
  description: {type: String, required: true},
	MAINNET: {type: String, required: true},
  KOVAN: {type: String, required: true},
  RINKEBY: {type: String, required: true},
	decimal: {type: Number, required: true}},
  {timestamps: true});

exports.TokenSchema = TokenSchema;
exports.TokenModel = mongoose.model("Token", TokenSchema);
