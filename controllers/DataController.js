const TokenModel = require("../models/TokenModel");

const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);


// Token Schema
function TokenData(data) {
	this.id = data._id;
	this.name = data.name;
  this.description = data.description;
	this.MAINNET = data.MAINNET;
	this.KOVAN = data.KOVAN;
	this.RINKEBY = data.RINKEBY;
	this.decimal = data.decimal;
}

/**
 * Create token.
 *
 * @param {string} name
 * @param {string} address
 *
 * @returns {Object}
 */

 exports.tokenStore = [
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value) => {
		return TokenModel.findOne({name : value}).then((token) => {
			if (token) {
				return Promise.reject("Token already saved down");
			}
		});
	}),
	body("address", "Description must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var token = new TokenModel(
				{ name: req.body.name,
					address: req.body.address}
						);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save token.
				token.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let tokenData = new TokenData(token);
					return apiResponse.successResponseWithData(res,"Token add Success.", tokenData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * List tokens.
 *
 * @returns {Object}
 */
 exports.tokenList = [
	async function (req, res) {
		const tokens = await TokenModel.find();
		try {
			if(tokens.length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", tokens);
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
 * List tokens.
 *
 * @param {int} id
 *
 * @returns {Object}
 */
 exports.token = [
	async function (req, res) {
		const token = await TokenModel.findOne({name: req.params.tokenName});
		try {
			if(Object.keys(token).length > 0){
				return apiResponse.successResponseWithData(res, "Operation success", token);
			}else{
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}

		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
