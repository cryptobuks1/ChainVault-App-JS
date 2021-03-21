const consumable = require('./exchanges/consumables.js')
const uniDEX = require('./exchanges/uniswap.js');
var assert = require('assert');

async function swapExactFor(exchange, tokenA, tokenB, sellAmount, maxSlippage, deadline, nonce) {

  /***
    @param {string} exchange is what platform to tx on
    @param {string} tokenA is token to sell
    @param {string} tokenB is token to buy
    @param {int} swapAmount is amount to sell
    @param {int} maxSlippage sets the max slippage in %
    @param {int} nonce is tx seed
  ***/

  // TODO : Check balance(tokenA) > sellAmount
  // TODO : Check that tokenA has been approved for exchange router

  if (exchange == "uniswap"){
    minToSwap = String((sellAmount*(1-maxSlippage)*
                parseFloat(String(await uniDEX.price(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap ${sellAmount} of ${tokenA} for atleast ${minToSwap} of ${tokenB} on uniswap`);
    return (await uniDEX.swapExactFor(tokenA, tokenB,
                         consumable.web3.utils.toWei(String(sellAmount), "ether"),
                         consumable.web3.utils.toWei(String(minToSwap), "ether"), deadline, nonce));
  }
}

async function swapForExact(exchange, tokenA, tokenB, buyAmount, maxSlippage, deadline, nonce) {

  /***
    @param {string} exchange is what platform to tx on
    @param {string} tokenA is token to sell
    @param {string} tokenB is token to buy
    @param {int} swapAmount is amount to sell
    @param {int} maxSlippage sets the max slippage in %
    @param {int} nonce is tx seed
  ***/

  // TODO : Check balance(tokenA) > maxSwapFor
  // TODO : Check that tokenA has been approved for exchange router

  if (exchange == "uniswap"){
    maxSwapFor = String((buyAmount*(1+maxSlippage)*
                 1./parseFloat(String(await uniDEX.price(tokenA,tokenB)))).toFixed(18));
    console.log(`Attempting to swap at most ${maxSwapFor} of ${tokenA} for ${buyAmount} of ${tokenB} on uniswap`);
    return (await uniDEX.swapForExact(tokenA, tokenB, consumable.web3.utils.toWei(String(maxSwapFor), "ether"),
                         consumable.web3.utils.toWei(String(buyAmount), "ether"), deadline, nonce));
  }
}

async function addLiquidity(exchange, tokenA, tokenB, desiredA, desiredB, minA, minB, deadline, nonce) {

  /***
    @param {string} exchange is what platform to tx on
    @param {string} tokenA is token
    @param {string} tokenB is token, must not e ETH
    @param {int} desiredA is desired amount of tokenA to post
    @param {int} desiredB is desired amount of tokenB to post
    @param {int} minA is min. amount of tokenA to post
    @param {int} minB is min. amount of tokenB to post
  ***/

  // TODO : Check balance(tokenA) > maxSwapFor
  // TODO : Check balance(tokenB) > maxSwapFor
  // TODO : Check that tokenA has been approved for exchange router
  // TODO : Check that tokenB has been approved for exchange router
  // TODO : Is there anything we should do to precompute minA/minB ??

  assert(tokenB != "ETH");
  if (exchange == "uniswap"){
    console.log(`Attempting to post at most ${desiredA} of ${tokenA} and ${desiredB} of ${tokenB} into a uniswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be posted`);
    return (await uniDEX.addLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(desiredA), "ether"),
                         consumable.web3.utils.toWei(String(desiredB), "ether"), minA, minB, deadline, nonce));
  }
}


async function removeLiquidity(exchange, tokenA, tokenB, liquidity, minA, minB, deadline, nonce) {

  /***
    @param {string} exchange is what platform to tx on
    @param {string} tokenA is token,
    @param {string} tokenB is token, must not ETH
    @param {int} liquidity is amount to draw from pool
    @param {int} minA is min. amount of tokenA to receive
    @param {int} minB is min. amount of tokenB to receive
  ***/

  // TODO : Check balance(lp(tokenA,tokenB,exchange)) > liquidity
  // TODO : Check that lp(tokenA,tokenB,exchange) has been approved for exchange router
  // TODO : Is there anything we should do to precompute minA/minB ??

  assert(tokenB != "ETH");
  if (exchange == "uniswap"){
    console.log(`Attempting to remove ${liquidity} of ${tokenA}-${tokenB} from a uniswap lp`);
    console.log(`Atleast ${minA} of ${tokenA} and ${minB} of ${tokenB} must be returned`);
    return (await uniDEX.removeLiquidity(tokenA, tokenB, consumable.web3.utils.toWei(String(liquidity), "ether"),
                         minA, minB, deadline, nonce));
  }
}
