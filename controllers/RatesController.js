const { TokenModel } = require("../models/TokenModel");
const compoundUtils = require("./utils/rates/compound");
const aaveUtils = require("./utils/rates/aave");

const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const { token } = require("./DataController");
mongoose.set("useFindAndModify", false);


/**
 * Redeem tokens
 *
 * @param {float} amount
 *
 * @returns {Object}
 */
 exports.redeem = [
	auth,
    body("tokenName").isLength({ min: 3 }).trim().withMessage("cToken name must be 3 characters or greater.").isAlphanumeric(),
    body("amount").isLength({ min: 1 }).trim().withMessage("Amount of cToken to redeem.")
		.isNumeric({ min: 0.00000001 }).withMessage("Amount must be numeric."),
    sanitizeBody("amount").escape(),
	async function (req, res) {
		//try {
            var tokenAmount;
            var result;
            const tokenName = req.body.tokenName;
            if (req.body.tokenName == "ETH") {
			    result = await compoundUtils.redeemETH(req.user, req.body.amount);
            } else {
                result = await compoundUtils.redeemERC20(req.user, tokenName, req.body.amount);
            }
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success": result});
			}else{
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		//} catch (err) {
			//throw error in json response with status 500.
		//	return apiResponse.ErrorResponse(res, err);
		//}
	}
];

/**
 * Lend tokens.
 *
 * @param {string} tokenName
 * @param {float} amount
 *
 * @returns {Object}
 */
 exports.lend = [
	auth,
    body("tokenName").isLength({ min: 3 }).trim().withMessage("Token name must be 3 characters or greater.").isAlphanumeric(),
    body("amount").isLength({ min: 1 }).trim().withMessage("Amount of token to lend must be specified.")
		.isNumeric({ min: 0.00000001 }).withMessage("Amount must be numeric."),
    sanitizeBody("tokenName").escape(),
    sanitizeBody("amount").escape(),
	async function (req, res) {
		try {
            var result;
            if (req.body.tokenName == "ETH") {
                result = await compoundUtils.lendETH(req.user, req.body.amount);
            } else {
                result = await compoundUtils.lendERC20(req.user, req.body.tokenName, req.body.amount);
            }
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * Supply collateral.
 *
 * @param {[string]} tokenNames
 * @param {[float]} amounts
 *
 * @returns {Object}
 */
 exports.supplyCollateral = [
	auth,
    body("tokenNames").isArray(),
    body("amounts").isArray(),
	async function (req, res) {
		try {
            var result = await compoundUtils.supplyCollateral(req.user, req.body.tokenNames, req.body.amounts);
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * Remove collateral.
 *
 * @param {[string]} tokenNames
 * @param {boolean} verbose
 *
 * @returns {Object}
 */
 exports.removeCollateral = [
	auth,
    body("tokenNames").isArray(),
	async function (req, res) {
		try {
            var result = await compoundUtils.removeCollateral(req.user, req.body.tokenNames);
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * List collateral.
 *
 * @returns {Object}
 */
 exports.collateral = [
	auth,
	async function (req, res) {
		try {
            var result = await compoundUtils.collateral(req.user);
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * Borrow tokens.
 *
 * @param {string} tokenName
 * @param {float} amount
 *
 * @returns {Object}
 */
 exports.borrow = [
	auth,
    body("tokenName").isLength({ min: 3 }).trim().withMessage("Token name must be 3 characters or greater.").isAlphanumeric(),
    body("amount").isLength({ min: 1 }).trim().withMessage("Amount of token to lend must be specified.")
		.isNumeric({ min: 0.00000001 }).withMessage("Amount must be numeric."),
    sanitizeBody("tokenName").escape(),
    sanitizeBody("amount").escape(),
	async function (req, res) {
		try {
            var result;
            if (req.body.tokenName == "ETH") {
                result = await compoundUtils.borrowETH(req.user, req.body.amount);
            } else {
                result = await compoundUtils.borrowERC20(req.user, req.body.tokenName, req.body.amount);
            }
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * Get balances.
 *
 * @returns {Object}
 */
 exports.borrowBalances = [
	auth,
	async function (req, res) {
		try {
            var result =  await compoundUtils.borrowBalances(req.user);
            if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
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
 * Repay tokens.
 *
 * @param {string} tokenName
 * @param {float} amount
 *
 * @returns {Object}
 */
 exports.repay = [
	auth,
    body("tokenName").isLength({ min: 3 }).trim().withMessage("Token name must be 3 characters or greater.").isAlphanumeric(),
    body("amount").isLength({ min: 1 }).trim().withMessage("Amount of token to lend must be specified.")
		.isNumeric({ min: 0.00000001 }).withMessage("Amount must be numeric."),
    sanitizeBody("tokenName").escape(),
    sanitizeBody("amount").escape(),
	async function (req, res) {
		try {
            var result;
            if (req.body.tokenName == "ETH") {
                result = await compoundUtils.repayETH(req.user, req.body.amount);
            } else {
                result = await compoundUtils.repayERC20(req.user, req.body.tokenName, req.body.amount);
            }
			if(Object.keys(result).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", { "success" : result });
			}else{
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
