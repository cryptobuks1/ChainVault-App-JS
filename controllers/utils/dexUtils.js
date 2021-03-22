const consumable = require('./exchanges/consumables.js')
const uniDEX = require('./exchanges/uniswap.js');
const sushiDEX = require('./exchanges/sushiswap.js');
const assert = require('assert');

async function swapExactFor(exchange, tokenA, tokenB, sellAmount, maxSlippage, deadline, nonce) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} swapAmount is amount to sell
   * @param {int} maxSlippage sets the max slippage in %
   * @param {int} deadline is exec. timeout
   * @param {int} nonce is tx seed
   *
   * @returns {Object}
  **/

  // TODO : Check balance(tokenA) > sellAmount
  // TODO : Check that tokenA has been approved for exchange router

  if (exchange == "uniswap") {
    minToSwap = String((sellAmount*(1-maxSlippage)*
                parseFloat(String(await uniDEX.midPrice(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap ${sellAmount} of ${tokenA} for atleast ${minToSwap} of ${tokenB} on uniswap`);
    return (await uniDEX.swapExactFor(tokenA, tokenB,
                         consumable.web3.utils.toWei(String(sellAmount), "ether"),
                         consumable.web3.utils.toWei(String(minToSwap), "ether"), deadline, nonce));
  } else if (exchange == "sushiswap") {
    minToSwap = String((sellAmount*(1-maxSlippage)*
                parseFloat(String(await sushiDEX.midPrice(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap ${sellAmount} of ${tokenA} for atleast ${minToSwap} of ${tokenB} on sushiswap`);
    return (await sushiDEX.swapExactFor(tokenA, tokenB,
                         consumable.web3.utils.toWei(String(sellAmount), "ether"),
                         consumable.web3.utils.toWei(String(minToSwap), "ether"), deadline, nonce));
  }
}

async function swapForExact(exchange, tokenA, tokenB, buyAmount, maxSlippage, deadline, nonce) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token to sell
   * @param {string} tokenB is token to buy
   * @param {int} swapAmount is amount to sell
   * @param {int} maxSlippage sets the max slippage in %
   * @param {int} deadline is exec. timeout
   * @param {int} nonce is tx seed
   *
   * @returns {Object}
  **/

  // TODO : Check balance(tokenA) > maxSwapFor
  // TODO : Check that tokenA has been approved for exchange router

  if (exchange == "uniswap") {
    maxSwapFor = String((buyAmount*(1+maxSlippage)*
                 1./parseFloat(String(await uniDEX.midPrice(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap at most ${maxSwapFor} of ${tokenA} for ${buyAmount} of ${tokenB} on uniswap`);
    return (await uniDEX.swapForExact(tokenA, tokenB, consumable.web3.utils.toWei(String(maxSwapFor), "ether"),
                         consumable.web3.utils.toWei(String(buyAmount), "ether"), deadline, nonce));
  } else if (exchange == "sushiswap") {
    maxSwapFor = String((buyAmount*(1+maxSlippage)*
                 1./parseFloat(String(await sushiDEX.midPrice(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap at most ${maxSwapFor} of ${tokenA} for ${buyAmount} of ${tokenB} on sushiswap`);
    return (await sushiDEX.swapForExact(tokenA, tokenB, consumable.web3.utils.toWei(String(maxSwapFor), "ether"),
                         consumable.web3.utils.toWei(String(buyAmount), "ether"), deadline, nonce));
  }
}

async function addLiquidity(exchange, tokenA, tokenB, desiredA, desiredB, minA, minB, deadline, nonce) {

  /**
  * @param {string} exchange is what platform to tx on
  * @param {string} tokenA is token
  * @param {string} tokenB is token, must not e ETH
  * @param {int} desiredA is desired amount of tokenA to post
  * @param {int} desiredB is desired amount of tokenB to post
  * @param {int} minA is min. amount of tokenA to post
  * @param {int} minB is min. amount of tokenB to post
  * @param {int} deadline is exec. timeout
  * @param {int} nonce is tx seed
  *
  * @returns {Object}
  **/

  // TODO : Check balance(tokenA) > maxSwapFor
  // TODO : Check balance(tokenB) > maxSwapFor
  // TODO : Check that tokenA has been approved for exchange router
  // TODO : Check that tokenB has been approved for exchange router
  // TODO : Is there anything we should do to precompute minA/minB ??

  assert(tokenB != "ETH", "tokenB must not equal ETH");
  if (exchange == "uniswap") {
    console.log(`Attempting to post at most ${desiredA} of ${tokenA} and ${desiredB} of ${tokenB} into a uniswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be posted`);
    return (await uniDEX.addLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(desiredA), "ether"),
                         consumable.web3.utils.toWei(String(desiredB), "ether"), minA, minB, deadline, nonce));
  } else if (exchange == "sushiswap") {
    console.log(`Attempting to post at most ${desiredA} of ${tokenA} and ${desiredB} of ${tokenB} into a sushiswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be posted`);
    return (await sushiDEX.addLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(desiredA), "ether"),
                         consumable.web3.utils.toWei(String(desiredB), "ether"), minA, minB, deadline, nonce));
  }
}

async function removeLiquidity(exchange, tokenA, tokenB, liquidity, minA, minB, deadline, nonce) {

  /**
   * @param {string} exchange is what platform to tx on
   * @param {string} tokenA is token,
   * @param {string} tokenB is token, must not ETH
   * @param {int} liquidity is amount to draw from pool
   * @param {int} minA is min. amount of tokenA to receive
   * @param {int} minB is min. amount of tokenB to receive
   * @param {int} deadline is exec. timeout
   * @param {int} nonce is tx seed
   *
   * @returns {Object}
  **/

  // TODO : Check balance(lp(tokenA,tokenB,exchange)) > liquidity
  // TODO : Check that lp(tokenA,tokenB,exchange) has been approved for exchange router
  // TODO : Is there anything we should do to precompute minA/minB ??

  assert(tokenB != "ETH", "tokenB must not equal ETH");
  console.log("Calling remove liquidity...");
  if (exchange == "uniswap") {
    console.log(`Attempting to remove ${liquidity} of ${tokenA}-${tokenB} from a uniswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be returned`);
    result = (await uniDEX.removeLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(liquidity), "ether"),
                         minA, minB, deadline, nonce));
    console.log("About to log result...");
    console.log(result);
    return result;
  } else if (exchange == "sushiswap") {
    console.log(`Attempting to remove ${liquidity} of ${tokenA}-${tokenB} from a sushiswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be returned`);
    return (await sushiDEX.removeLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(liquidity), "ether"),
                         minA, minB, deadline, nonce));
  }
}

async function routeToLP(exchange, tokenA, tokenB) {
  if (exchange == "uniswap") {
    return (await uniDEX.routeToLP(tokenA, tokenB, 0, 0));
  } else if (exchange == "sushiswap") {
    return (await sushiDEX.routeToLP(tokenA, tokenB, 0, 0));
  }
}

async function midPrice(exchange, tokenA, tokenB) {
  if (exchange == "uniswap") {
    return (await uniDEX.midPrice(tokenA, tokenB));
  } else if (exchange == "sushiswap") {
    return (await sushiDEX.midPrice(tokenA, tokenB));
  }
}

async function tradeImpacts(exchange, tokenA, tokenB, amountA, amountB, type) {
  if (exchange == "uniswap") {
    return (await uniDEX.tradeImpacts(tokenA, tokenB, amountA, amountB, type));
  } else if (exchange == "sushiswap") {
    return (await sushiDEX.tradeImpacts(tokenA, tokenB, amountA, amountB, type));
  }
}

async function queryGraph(exchange, query) {
  if (exchange == "uniswap") {
    return (await uniDEX.queryGraph(query));
  } else if (exchange == "sushiswap") {
    return (await sushiDEX.queryGraph(query));
  }
}

module.exports.swapExactFor = swapExactFor;
module.exports.swapForExact = swapForExact;
module.exports.addLiquidity = addLiquidity;
module.exports.removeLiquidity = removeLiquidity;
module.exports.routeToLP = routeToLP;
module.exports.midPrice = midPrice;
module.exports.tradeImpacts = tradeImpacts;
module.exports.queryGraph = queryGraph;
