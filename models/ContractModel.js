var mongoose = require("mongoose");

var ContractSchema = new mongoose.Schema({
	name: {type: String, required: true},
  description: {type: String, required: true},
	MAINNET: {type: String, required: true},
  KOVAN: {type: String, required: true},
  RINKEBY: {type: String, required: true}},
  {timestamps: true});


exports.ContractSchema = ContractSchema;
exports.ContractModel = mongoose.model("Contract", ContractSchema);
