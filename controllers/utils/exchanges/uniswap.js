const uniswap = require('@uniswap/sdk');
const consumable = require('./consumables.js')
var assert = require('assert');
const fetch = require('node-fetch');

async function getPath(tokenA, tokenB) {

  /**
   * @param {string} tokenA is token
   * @param {string} tokenB is token
   *
   * @returns {array} tokenA, tokenB
  **/

  if (tokenA == "ETH") {
    tokenA = "WETH";
  } else if (tokenB == "ETH") {
    tokenB = "WETH";
  }
  return (await [consumable.tokens[tokenA].address, consumable.tokens[tokenB].address]);
}

async function swapExactFor(web3, tokenA, tokenB, fromSwap, toSwap, deadline) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} swapAmount is amount to sell
   * @param {int} maxSlippage sets the max slippage in %
   * @param {int} deadline is exec. timeout
   *
   * @returns {Object}
  **/

  // TODO: HOW CAN WE MAKE ROUTER / WEB3 INSTANCE INTO A USER DEFINED VARIABLE?

  const publicKey = (await (web3.eth.getAccounts()))[0];
  const routerAddress = await (consumable.contracts["UNI_ROUTER"]["address"]);
  tx = { from: publicKey, to: routerAddress };
  uniRouterContract = await (new web3.eth.Contract(consumable.routerContract.abi, routerAddress));
  path = (await getPath(tokenA, tokenB));
  if (tokenA == "ETH") {
    tx['value'] = fromSwap;
    tokenA = "WETH";
    return (await uniRouterContract.methods.swapExactETHForTokens(toSwap, path,
                                              publicKey, deadline).send(tx));
  } else if (tokenB == "ETH") {
    tokenB = "WETH";
    return (await uniRouterContract.methods.swapExactTokensForETH(fromSwap, toSwap, path,
                                              publicKey, deadline).send(tx));
  } else {
    return (await uniRouterContract.methods.swapExactTokensForTokens(fromSwap, toSwap, path,
                                              publicKey, deadline).send(tx));
  }
}

async function swapForExact(tokenA, tokenB, fromSwap, toSwap, deadline) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} swapAmount is amount to sell
   * @param {int} maxSlippage sets the max slippage in %
   * @param {int} deadline is exec. timeout
   *
   * @returns {Object}
  **/

  const publicKey = (await (web3.eth.getAccounts()))[0];
  const routerAddress = await (consumable.contracts["UNI_ROUTER"]["address"]);
  tx = { from: publicKey, to: routerAddress };
  uniRouterContract = await (new web3.eth.Contract(consumable.routerContract.abi, routerAddress));
  path = (await getPath(tokenA, tokenB));
  if (tokenA == "ETH") {
    tokenA = "WETH";
    tx['value'] = fromSwap;
    // using special method for trading ethereum
    return (await uniRouterContract.methods.swapETHForExactTokens(toSwap, path,
                                               publicKey, deadline).send(tx));
  } else if (tokenB == "ETH") {
    tokenB = "WETH";
    // using special method for trading for ethereum
    return (await uniRouterContract.methods.swapTokensForExactETH(toSwap, fromSwap, path,
                                               publicKey, deadline).send(tx));
  } else {
    // using erc20 only method
    return (await uniRouterContract.methods.swapTokensForExactTokens(toSwap, fromSwap, path,
                                               publicKey, deadline).send(tx));
  }
}

async function addLiquidity(web3, tokenA, tokenB, desiredA, desiredB, minA, minB, deadline) {

  /**
  * @param {string} exchange is what platform to tx on
  * @param {string} tokenA is token
  * @param {string} tokenB is token, must not e ETH
  * @param {int} desiredA is desired amount of tokenA to post
  * @param {int} desiredB is desired amount of tokenB to post
  * @param {int} minA is min. amount of tokenA to post
  * @param {int} minB is min. amount of tokenB to post
  * @param {int} deadline is exec. timeout
  *
  * @returns {Object}
  **/
  const publicKey = (await (web3.eth.getAccounts()))[0];
  const routerAddress = await (consumable.contracts["UNI_ROUTER"]["address"]);
  tx = { from: publicKey, to: routerAddress };
  uniRouterContract = await (new web3.eth.Contract(consumable.routerContract.abi, routerAddress));
  path = (await getPath(tokenA, tokenB));
  if (tokenA == "ETH") {
    // using special method for posting ethereum
    tx['value'] = desiredA;
    result = (await uniRouterContract.methods.addLiquidityETH(consumable.tokens[tokenB].address,
                                               desiredB, minA, minB, publicKey, deadline).send(tx));
    return result;

  } else {
    // using other method
    return (await uniRouterContract.methods.addLiquidity(consumable.tokens[tokenA].address,
                                               consumable.tokens[tokenB].address, desiredA, desiredB, minA, minB,
                                               publicKey, deadline).send(tx));
  }
}

async function removeLiquidity(web3, tokenA, tokenB, liquidity, minA, minB, deadline) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token,
   * @param {string} tokenB is token, must not ETH
   * @param {int} liquidity is amount to draw from pool
   * @param {int} minA is min. amount of tokenA to receive
   * @param {int} minB is min. amount of tokenB to receive
   * @param {int} deadline is exec. timeout
   *
   * @returns {Object}
  **/

  const publicKey = (await (web3.eth.getAccounts()))[0];
  const routerAddress = await (consumable.contracts["UNI_ROUTER"]["address"]);
  tx = { from: publicKey, to: routerAddress };
  uniRouterContract = await (new web3.eth.Contract(consumable.routerContract.abi, routerAddress));
  path = (await getPath(tokenA, tokenB));
  if (tokenA == "ETH") {
    tokenA = "WETH";
    return (await uniRouterContract.methods.removeLiquidityETH(consumable.tokens[tokenB].address, liquidity,
                  minA, minB, publicKey, deadline).send(tx));
  } else {
    return (await uniRouterContract.methods.removeLiquidity(consumable.tokens[tokenA].address, consumable.tokens[tokenB].address,
                  liquidity, minA, minB, publicKey, deadline).send(tx));
  }
}

async function tokenMaker(tokenName, tokenAmount=0) {

  /***
  * @param {string} tokenName is token
  *
  * @returns {Object} token object
  ***/

  if (tokenName == "ETH") {
    tokenName = "WETH";
  }
  const token_ = await (new uniswap.Token(uniswap.ChainId[consumable.CHAIN], consumable.tokens[tokenName].address, 18, tokenName));
  const tokenAmount_ = await (new uniswap.TokenAmount(token_, tokenAmount));
  return tokenAmount_;
}

async function pairMaker(tokenA, tokenB, amountA, amountB) {

  /***
  * @param {string} tokenA is token,
  * @param {string} tokenB is token
  *
  * @returns {Object} pair object
  ***/

  if (tokenA == "ETH") {
    tokenA = "WETH";
  }
  assert(tokenB != "ETH", "tokenB must not be ETH");
  const tokenA_ = await tokenMaker(tokenA, amountA);
  const tokenB_ = await tokenMaker(tokenB, amountB);
  const pair = await (new uniswap.Pair(tokenA_, tokenB_));
  return pair;
}

async function routeToLP(tokenA, tokenB, amountA, amountB) {

  /***
  * @param {string} tokenA is token
  * @param {string} tokenB is token, must not ETH
  *
  * @returns {string} address to liquidity pool
  ***/

  if (tokenA == "ETH") {
    tokenA = "WETH";
  }
  pair = await pairMaker(tokenA, tokenB, amountA, amountB);
  const address = pair.liquidityToken.address;
  console.log(`The path to the ${tokenA}-${tokenB} LP on uniswap is ${address}`);
  return String(address);
}

async function midPrice(tokenA, tokenB) {

  /***
  *  @param {string} tokenA is token,
  *  @param {string} tokenB is token, must not ETH
  *
  * @returns {float} price
  ***/

  if (tokenA == "ETH") {
    tokenA = "WETH";
  }
  const tokenA_ = (await tokenMaker(tokenA, 0)).token;
  const tokenB_ = (await tokenMaker(tokenB, 0)).token;
  const pair = await(new uniswap.Fetcher.fetchPairData(tokenA_, tokenB_));
  const route = await(new uniswap.Route([pair], tokenA_));
  const price_ = await route.midPrice.toSignificant(6);
  console.log(`The price of ${tokenA} in ${tokenB} on uniswap is ${price_} `);
  return price_;
}

async function tradeImpacts(tokenA, tokenB, amountA, amountB, type) {

  /***
  *  @param {string} tokenA is token
  *  @param {string} tokenB is token, must not ETH
  *  @param {Object} is TokenAmount of tokenA
  *  @param {Object} is TokenAmount of tokenB
  *  @param {Object} is type of TradeType
  *
  * @returns {Object} of type trade
  ***/

  // TODO: Can we understand why this object gives strange results??
  if (tokenA == "ETH") {
    tokenA = "WETH";
  }
  const pair = await pairMaker(tokenA, tokenB, amountA, amountB);
  const tokenA_ = await tokenMaker(tokenA, amountA);
  const route = new uniswap.Route([pair], tokenA_.token);
  const trade = new uniswap.Trade(route, tokenA_, type)
  return (await trade);
}

async function queryGraph(query) {

  /***
  *  @param {string} query is graphQL query
  *
  * @returns {Object} of type json result
  ***/

  console.log("Querying URL=",consumable.UNIGRAPH_URI);

  const res = await fetch(consumable.UNIGRAPH_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
}
module.exports.swapExactFor = swapExactFor;
module.exports.swapForExact = swapForExact;
module.exports.addLiquidity = addLiquidity;
module.exports.removeLiquidity = removeLiquidity;
module.exports.tokenMaker = tokenMaker;
module.exports.pairMaker = pairMaker;
module.exports.routeToLP = routeToLP;
module.exports.midPrice = midPrice;
module.exports.tradeImpacts = tradeImpacts;
module.exports.queryGraph = queryGraph;
