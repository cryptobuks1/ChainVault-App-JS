//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const dexUtils = require("./utils/dexUtils.js")
const consumable = require('./utils/exchanges/consumables.js')

//const TokenModel = require("../models/TokenModel");
//const ContractModel = require("../models/ContractModel");
const { body,validationResult } = require("express-validator");

/**
 * Price on an exchange
 *
 * @returns {Number}, price of tokenA in tokenB
 */

 exports.price = [
	async function (req, res) {
		try {
      const exchange = req.params.exchangeName;
      const tokenToPrice = req.params.tokenToPrice;
      const tokenToPriceIn = req.params.tokenToPriceIn;

      console.log(`Fetching price on exchange=${exchange}`);
      midPrice = await dexUtils.midPrice(exchange, tokenToPrice, tokenToPriceIn);
      console.log(`tokenToPrice=${tokenToPrice}, tokenToPriceIn=${tokenToPriceIn}, MidPrice=${midPrice}`);
			return apiResponse.successResponseWithData(res, "Operation success", midPrice);
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * LPAddress
 *
 * @returns {String}, address of lp
 */

exports.LPaddress = [
 async function (req, res) {
   try {
     const exchange = req.params.exchangeName;
     const tokenA = req.params.tokenA;
     const tokenB = req.params.tokenB;

     lpaddress = await dexUtils.routeToLP(exchange, tokenA, tokenB);
     console.log(`tokenA=${tokenA}, tokenB=${tokenB}, lpaddress=${lpaddress}`);
     return apiResponse.successResponseWithData(res, "Operation success", lpaddress);
    } catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    }
 }
];

/**
 * swapForExact - Swap tokenA for an exact amount of tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.swapForExact = [
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("buyAmount").isLength({ min: 1 }).trim().withMessage("buyAmount must be specified."),
  body("maxSlippage").isLength({ min: 1 }).trim().withMessage("maxSlippage must be specified."),
  async (req, res) => {
    try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const buyAmount = String(req.body.buyAmount);
     const maxSlippage = String(req.body.maxSlippage);
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     const nonce =  (await consumable.web3.eth.getTransactionCount(consumable.PUBLIC_KEY, "latest")); // get latest nonce
     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, buyAmount=${buyAmount}, maxSlippage=${maxSlippage}, deadline=${deadline}, nonce=${nonce}`);
     result = (await dexUtils.swapForExact(exchange, tokenA, tokenB, buyAmount, maxSlippage, deadline, nonce));
     return apiResponse.successResponseWithData(res, "Operation success", result);
    } catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    }
 }
];

/**
 * addLP - Add liquidity to pool corresponding to tokenA and tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.addLP = [
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("desiredA").isLength({ min: 1 }).trim().withMessage("desiredA must be specified."),
  body("desiredB").isLength({ min: 1 }).trim().withMessage("desiredB must be specified."),
  body("minA").isLength({ min: 1 }).trim().withMessage("minA must be specified."),
  body("minB").isLength({ min: 1 }).trim().withMessage("minB must be specified."),
  async (req, res) => {
    try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const desiredA = String(req.body.desiredA);
     const desiredB = String(req.body.desiredB);
     const minA = String(req.body.minA);
     const minB = String(req.body.minB);
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     const nonce =  (await consumable.web3.eth.getTransactionCount(consumable.PUBLIC_KEY, "latest")); // get latest nonce
     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, desiredA=${desiredA}, desiredB=${desiredB}, minA=${minA}, minB=${minB}, deadline=${deadline}, nonce=${nonce}`);
     result = (await dexUtils.addLiquidity(exchange, tokenA, tokenB, desiredA, desiredB, minA, minB, deadline, nonce));
     return apiResponse.successResponseWithData(res, "Operation success", result);
    } catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    }
 }
];

/**
 * removeLP - Remove liquidity from pool corresponding to tokenA and tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.removeLP = [
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("liquidity").isLength({ min: 1 }).trim().withMessage("liquidity must be specified."),
  body("minA").isLength({ min: 1 }).trim().withMessage("minA must be specified."),
  body("minB").isLength({ min: 1 }).trim().withMessage("minB must be specified."),
  async (req, res) => {
    try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const liquidity = String(req.body.liquidity);
     const minA = String(req.body.minA);
     const minB = String(req.body.minB);
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     const nonce =  (await consumable.web3.eth.getTransactionCount(consumable.PUBLIC_KEY, "latest")); // get latest nonce
     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, liquidity=${liquidity}, minA=${minA}, minB=${minB}, deadline=${deadline}, nonce=${nonce}`);
     result = (await dexUtils.removeLiquidity(exchange, tokenA, tokenB,
                liquidity, minA, minB, deadline, nonce));
     return apiResponse.successResponseWithData(res, "Operation success", result);
    } catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    }
 }
];
