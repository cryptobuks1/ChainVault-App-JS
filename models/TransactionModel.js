var mongoose = require("mongoose");

var TradeSchema = new mongoose.Schema({
    transactionID: {type: String, required: true},
    exchange: {type: String, require: true},
    tokenA: {type: String, required: true},
    tokenB: {type: String, require: true},
    sizeA: {type: Number, required: true},
    sizeB: {type: Number, required: true},
	priceA: {type: Number, required: true},
    priceB: {type: Number, required: true},
    gasPrice: {type: Number, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}},
    {timestamps: true});

var RatesSchema = new mongoose.Schema({
    transactionID: {type: String, required: true},
    exchange: {type: String, require: true},
    tokenA: {type: String, required: true},
    tokenB: {type: String, require: true},
    sizeA: {type: Number, required: true},
    sizeB: {type: Number, required: true},
	priceA: {type: Number, required: true},
    priceB: {type: Number, required: true},
    gasPrice: {type: Number, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}},
    {timestamps: true});

exports.TradeSchema = TradeSchema;
exports.TradeModel = mongoose.model("Trade", TradeSchema);