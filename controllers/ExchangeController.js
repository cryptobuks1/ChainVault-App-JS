//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const dexUtils = require("./utils/dexUtils.js")
const consumable = require('./utils/exchanges/consumables.js')
const utils = require('./utils/utils.js');

const { body,validationResult } = require("express-validator");
const auth = require("../middlewares/jwt");

async function swapInfo(exchange, tokenA, tokenB, prevA, prevB, user) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} prevA is amount before trade
   * @param {int} prevB is amount before trade
   * @param {int} user is user making trade
   *
   * @returns {Object}
  **/

  var newA = (await utils.getBalance(user, tokenA))[tokenA];
  var newB = (await utils.getBalance(user, tokenB))[tokenB];
  const priceA_ = (await dexUtils.midPrice(exchange, tokenA, "DAI"));
  const priceB_ = (await dexUtils.midPrice(exchange, tokenB, "DAI"));
  var tradeInfo = {}
  tradeInfo[tokenA.concat('_trade')] = newA - prevA;
  tradeInfo[tokenB.concat('_trade')] = newB - prevB;
  tradeInfo[tokenA.concat('_price')] = priceA_;
  tradeInfo[tokenB.concat('_price')] = priceB_;

  return tradeInfo;
}

async function lpinfo(exchange, tokenA, tokenB, prevA, prevB, prevlp, user) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} prevA is amount before trade
   * @param {int} prevB is amount before trade
   * @param {int} user is user making trade
   *
   * @returns {Object}
  **/

  var newA = (await utils.getBalance(user, tokenA))[tokenA];
  var newB = (await utils.getBalance(user, tokenB))[tokenB];
  const priceA_ = (await dexUtils.midPrice(exchange, tokenA, "DAI"));
  const priceB_ = (await dexUtils.midPrice(exchange, tokenB, "DAI"));
  const lpName = tokenA.concat('_').concat(tokenB).concat('_').concat(exchange);
  var tradeInfo = {}
  tradeInfo[tokenA.concat('_trade')] = newA - prevA;
  tradeInfo[tokenB.concat('_trade')] = newB - prevB;
  tradeInfo[tokenA.concat('_price')] = priceA_;
  tradeInfo[tokenB.concat('_price')] = priceB_;
  tradeInfo[lpName.concat('_trade')] = 0;
  tradeInfo[lpName.concat('_price')] = 0;

  return tradeInfo;
}

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
 * Query the graph
 *
 * @returns {Object}, result of query
 */

 exports.queryGraph = [
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("query").isLength({ min: 1 }).trim().withMessage("query must be specified."),
	async (req, res) => {
		try {
      const exchange = String(req.params.exchangeName);
      const query = String(req.body.query);
      console.log(`Fetching graph on exchange=${exchange}`);
      const graph = (await dexUtils.queryGraph(exchange, query));
			return apiResponse.successResponseWithData(res, "Operation success", graph);
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * approveToken - approve token on target exchange
 *
 * @returns {Object}, result of token approval call
 */

exports.approveTransfer = [
  auth,
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("token").isLength({ min: 1 }).trim().withMessage("token must be specified."),
  body("amount").isLength({ min: 1 }).trim().withMessage("amount must be specified."),
  async (req, res) => {
    if (req.body.exchange == "uniswap") {
      output = (await utils.approveTransfer(req.user, consumable.contracts["UNI_ROUTER"].address, req.body.token, req.body.amount));
      return apiResponse.successResponseWithData(res, "Operation success", output);
    } else if (req.body.exchange == "sushiswap") {
      output = (await utils.approveTransfer(req.user, consumable.contracts["SUSHI_ROUTER"].address, req.body.token, req.body.amount));
      return apiResponse.successResponseWithData(res, "Operation success", output);
    }
    else{
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * swapExactFor - Swap an exact amount of tokenA for tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.swapExactFor = [
  auth,
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("sellAmount").isLength({ min: 1 }).trim().withMessage("sellAmount must be specified."),
  body("maxSlippage").isLength({ min: 1 }).trim().withMessage("maxSlippage must be specified."),
  async (req, res) => {
    //try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const sellAmount = String(req.body.sellAmount);
     const maxSlippage = String(req.body.maxSlippage);
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     var prevA = (await utils.getBalance(req.user, tokenA))[tokenA];
     var prevB = (await utils.getBalance(req.user, tokenB))[tokenB];

     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, buyAmount=${sellAmount}, maxSlippage=${maxSlippage}, deadline=${deadline}`);
     var output = (await dexUtils.swapExactFor(req.user, exchange, tokenA, tokenB, sellAmount, maxSlippage, deadline));
     output["tradeInfo"] = (await swapInfo(exchange, tokenA, tokenB, prevA, prevB, req.user));
     return apiResponse.successResponseWithData(res, "Operation success", output);
    //} catch (err) {
     //throw error in json response with status 500.
     console.log("Failed with error=",err);
     return apiResponse.ErrorResponse(res, err);
    //}
  }
];

/**
 * swapForExact - Swap tokenA for an exact amount of tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.swapForExact = [
  auth,
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("buyAmount").isLength({ min: 1 }).trim().withMessage("buyAmount must be specified."),
  body("maxSlippage").isLength({ min: 1 }).trim().withMessage("maxSlippage must be specified."),
  async (req, res) => {
    //try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const buyAmount = String(req.body.buyAmount);
     const maxSlippage = String(req.body.maxSlippage);
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     var prevA = (await utils.getBalance(req.user, tokenA))[tokenA];
     var prevB = (await utils.getBalance(req.user, tokenB))[tokenB];

     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, buyAmount=${buyAmount}, maxSlippage=${maxSlippage}, deadline=${deadline}`);
     var output = (await dexUtils.swapExactFor(req.user, exchange, tokenA, tokenB, buyAmount, maxSlippage, deadline));
     output["tradeInfo"] = (await swapInfo(exchange, tokenA, tokenB, prevA, prevB, req.user));
     return apiResponse.successResponseWithData(res, "Operation success", output);
    //} catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    //}
  }
];

/**
 * addLP - Add liquidity to pool corresponding to tokenA and tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.addLP = [
  auth,
  body("exchange").isLength({ min: 1 }).trim().withMessage("exchange must be specified."),
  body("tokenA").isLength({ min: 1 }).trim().withMessage("tokenA must be specified."),
  body("tokenB").isLength({ min: 1 }).trim().withMessage("tokenB must be specified."),
  body("desiredA").isLength({ min: 1 }).trim().withMessage("desiredA must be specified."),
  body("desiredB").isLength({ min: 1 }).trim().withMessage("desiredB must be specified."),
  body("minA").isLength({ min: 1 }).trim().withMessage("minA must be specified."),
  body("minB").isLength({ min: 1 }).trim().withMessage("minB must be specified."),
  async (req, res) => {
    //try {
     // TODO: How do we treat units, is it best to do it downstream >>> Do we assume everything is based on the 18 decimal system ?
     const exchange = String(req.body.exchange);
     const tokenA = String(req.body.tokenA);
     const tokenB = String(req.body.tokenB);
     const desiredA = String(req.body.desiredA);
     const desiredB = String(req.body.desiredB);
     const minA = String(req.body.minA);
     const minB = String(req.body.minB);
     var prevA = (await utils.getBalance(req.user, tokenA))[tokenA];
     var prevB = (await utils.getBalance(req.user, tokenB))[tokenB];
     var prevlp = 0;
     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, desiredA=${desiredA}, desiredB=${desiredB}, minA=${minA}, minB=${minB}, deadline=${deadline}`);
     output = (await dexUtils.addLiquidity(req.user, exchange, tokenA, tokenB, desiredA, desiredB, minA, minB, deadline));
     output["tradeInfo"] = (await lpinfo(exchange, tokenA, tokenB, prevA, prevB, prevlp, req.user));
     return apiResponse.successResponseWithData(res, "Operation success", output);
    //} catch (err) {
     //throw error in json response with status 500.
    // return apiResponse.ErrorResponse(res, err);
    //}
 }
];

/**
 * removeLP - Remove liquidity from pool corresponding to tokenA and tokenB
 *
 * @returns {Object}, result of lp removal call
 */

exports.removeLP = [
  auth,
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
     console.log(`exchange=${exchange}, tokenA=${tokenA}, tokenB=${tokenB}, liquidity=${liquidity}, minA=${minA}, minB=${minB}, deadline=${deadline}`);
     output = (await dexUtils.removeLiquidity(req.user, exchange, tokenA, tokenB,
                liquidity, minA, minB, deadline));
     output["tradeInfo"] = (await lpinfo(exchange, tokenA, tokenB, prevA, prevB, 0, req.user));
     return apiResponse.successResponseWithData(res, "Operation success", output);
    } catch (err) {
     //throw error in json response with status 500.
     return apiResponse.ErrorResponse(res, err);
    }
 }
];
