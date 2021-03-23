const { UserModel } = require("../models/UserModel");
const utils = require("./utils/utils");

const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");

const web3 = require("web3");
var Accounts = require('web3-eth-accounts');
var accounts = new Accounts('ws://localhost:8546');


/**
 * User registration.
 *
 * @param {string}      email
 * @param {string}      password
 * @param {string}      remoteAddress
 * @param {boolean}     level
 *
 * @returns {Object}
 */
exports.signup = [
	// Validate fields.
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	body("remoteAddress").isLength({ min: 1 }).trim().withMessage("Remote address must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("level").isLength({ min: 1 }).trim().withMessage("Remote address must be specified.")
		.isBoolean().withMessage("Level must be boolean."),
	// Sanitize fields.
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	sanitizeBody("remoteAddress").escape(),
	sanitizeBody("level").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				// create wallet
				var account = utils.createWallet();
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							email: req.body.email,
							password: hash,
							remoteAddress: req.body.remoteAddress,
							level: req.body.level,
							localAddress: account.address,
							localPrivateKey: account.privateKey
						}
					);
					// save user
					user.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						let userData = {
							_id: user._id,
							email: user.email,
							remoteAddress: user.remoteAddress,
							level: user.level,
							localAddress: user.localAddress
						};
						return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								let userData = {
									_id: user._id,
									email: user.email,
									remoteAddress: user.remoteAddress,
									level: user.level,
									localAddress: user.localAddress
								};
								//Prepare JWT token for authentication
								const jwtPayload = userData;
								const jwtData = {
									expiresIn: process.env.JWT_TIMEOUT_DURATION,
								};
								const secret = process.env.JWT_SECRET;
								//Generated JWT token with Payload and secret.
								userData.token = jwt.sign(jwtPayload, secret, jwtData);
								return apiResponse.successResponseWithData(res,"Login Success.", userData);
							} else{
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					} else{
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User logout.
 * 
 * @returns {Object}
 */
exports.logout = [
	auth,
	function (req, res) {
		try {
			// TODO: implement
			return apiResponse.successResponse(res,"Logout Success.");
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];