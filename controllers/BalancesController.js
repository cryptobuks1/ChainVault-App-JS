const TokenModel = require("../models/TokenModel");
const authUtils = require("./utils/authUtils");

const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);


/**
 * Gets balances.
 * 
 * @returns {Object}
 */
 exports.balancesList = [
	auth,
	async function (req, res) {
		try {
			var balanceList = await authUtils.getBalances(req.user);
			if(Object.keys(balanceList).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", balanceList);
			}else{
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Gets balances.
 * 
 * @returns {Object}
 */
 exports.balance = [
	auth,
	async function (req, res) {
		try {
			var balance = await authUtils.getBalance(req.user, req.params.tokenName);
			if(Object.keys(balance).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", balance);
			}else{
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];