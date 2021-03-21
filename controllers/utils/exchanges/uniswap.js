//const { wrapper } = require('./module.js');
const uniswap = require('@uniswap/sdk');
const consumable = require('./consumables.js')


async function swapExactFor(tokenA, tokenB, fromSwap, toSwap, deadline, nonce){

  /***
    @param {string} tokenA is token to sell
    @param {string} tokenB is token to buy
    @param {int} fromSwap is amount to sell
    @param {int} toSwap is min to buy or tx reverts
    @param {int} nonce is tx seed
  ***/

  path = [consumable.addresses[tokenA], consumable.addresses[tokenB]];
  tx = { from: consumable.PUBLIC_KEY, to: consumable.ADDRESS_UNI_ROUTER, nonce: nonce };
  if (tokenA == "ETH"){
    tx['value'] = fromSwap;
    return (await consumable.uniRouterContract.methods.swapExactETHForTokens(toSwap, path,
                                              consumable.PUBLIC_KEY, deadline).send(tx));
  } else if (tokenB == "ETH"){
    return (await consumable.uniRouterContract.methods.swapExactTokensForETH(fromSwap, toSwap, path,
                                              consumable.PUBLIC_KEY, deadline).send(tx));
  } else {
    return (await consumable.uniRouterContract.methods.swapExactTokensForTokens(fromSwap, toSwap, path,
                                              consumable.PUBLIC_KEY, deadline).send(tx));
  }
}

async function swapForExact(tokenA, tokenB, fromSwap, toSwap, deadline, nonce){

  /***
    @param {string} tokenA is token to sell
    @param {string} tokenB is token to buy
    @param {int} fromSwap is max amount to sell or tx reverts
    @param {int} toSwap is amt to buy
    @param {int} nonce is tx seed
  ***/

  path = [consumable.addresses[tokenA], consumable.addresses[tokenB]];
  tx = { from: consumable.PUBLIC_KEY, to: consumable.ADDRESS_UNI_ROUTER, nonce: nonce}
  if (tokenA == "ETH"){
    tx['value'] = fromSwap;
    // using special method for trading ethereum
    return (await consumable.uniRouterContract.methods.swapETHForExactTokens(toSwap, path,
                                               consumable.PUBLIC_KEY, deadline).send(tx));
  } else if (tokenB == "ETH"){
    // using special method for trading for ethereum
    return (await consumable.uniRouterContract.methods.swapTokensForExactETH(toSwap, fromSwap, path,
                                               consumable.PUBLIC_KEY, deadline).send(tx));
  } else {
    // using erc20 only method
    return (await consumable.uniRouterContract.methods.swapTokensForExactTokens(toSwap, fromSwap, path,
                                               consumable.PUBLIC_KEY, deadline).send(tx));
  }
}

async function addLiquidity(tokenA, tokenB, desiredA, desiredB, minA, minB, deadline, nonce){

  /***
    @param {string} tokenA is token
    @param {string} tokenB is token, must not e ETH
    @param {int} desiredA is desired amount of tokenA to post
    @param {int} desiredB is desired amount of tokenB to post
    @param {int} minA is min. amount of tokenA to post
    @param {int} minB is min. amount of tokenB to post
  ***/

  path = [consumable.addresses[tokenA], consumable.addresses[tokenB]];
  tx = { from: consumable.PUBLIC_KEY, to: consumable.ADDRESS_UNI_ROUTER, nonce: nonce};
  if (tokenA == "ETH"){
    // using special method for posting ethereum
    tx['value'] = desiredA;
    return (await consumable.uniRouterContract.methods.addLiquidityETH(consumable.addresses[tokenB],
                                               desiredB, minA, minB, consumable.PUBLIC_KEY, deadline).send(tx));
  } else {
    // using other method
    return (await consumable.uniRouterContract.methods.addLiquidity(consumable.addresses[tokenA],
                                               consumable.addresses[tokenB], desiredA, desiredB, minA, minB,
                                               consumable.PUBLIC_KEY, deadline).send(tx));
  }
}

async function removeLiquidity(tokenA, tokenB, liquidity, minA, minB, deadline, nonce) {

  /* add comments and safety checks */
  // TODO : make toSwap useful by having precomputed slippage threshold(s)

    path = [consumable.addresses[tokenA], consumable.addresses[tokenB]];
    tx = { from: consumable.PUBLIC_KEY, to: consumable.ADDRESS_UNI_ROUTER, nonce: nonce};
    if (tokenA == "ETH"){
      return (await consumable.uniRouterContract.methods.removeLiquidityETH(addresses[tokenB], liquidity,
                    minA, minB, consumable.PUBLIC_KEY, deadline).send(tx));
    } else {
      return (await consumable.uniRouterContract.methods.removeLiquidity(addresses[tokenA], addresses[tokenB],
                    liquidity, minA, minB, consumable.PUBLIC_KEY, deadline).send(tx));
    }
  }

async function price(tokenA, tokenB){

  /* add comments and safety checks */
  // TODO : make toSwap useful by having precomputed slippage threshold(s)
  const tokenA_ = new uniswap.Token(uniswap.ChainId[consumable.CHAIN], addresses[tokenA], 18);
  const tokenB_ = new uniswap.Token(uniswap.ChainId[consumable.CHAIN], addresses[tokenB], 18);
  const pair = await uniswap.Fetcher.fetchPairData(tokenA_, tokenB_);
  const route = new uniswap.Route([pair], tokenA_);
  console.log("route mid price = "+route.midPrice.toSignificant(6));
  return (await route.midPrice.toSignificant(6));

}

module.exports.swapExactFor = swapExactFor;
module.exports.swapForExact = swapForExact;
module.exports.addLiquidity = addLiquidity;
module.exports.removeLiquidity = removeLiquidity;
module.exports.price = price;
