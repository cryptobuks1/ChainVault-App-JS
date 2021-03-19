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
	this.name= data.name;
	this.address = data.address;
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
	body("name", "Title must not be empty.").isLength({ min: 1 }).trim(),
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