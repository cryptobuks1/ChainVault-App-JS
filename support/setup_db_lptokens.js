require("dotenv").config();
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = process.env.CHAIN;
var assert = require('assert');
const uniswap = require('@uniswap/sdk');
const sushiswap = require('@sushiswap/sdk');
const { TokenModel } = require('../models/TokenModel');
var MONGODB_URL = "mongodb://127.0.0.1/chainvaultdb";
var dbName = "chainvaultdb";
var mongoose = require("mongoose");
const MODELS = [TokenModel];

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
})
.catch(err => {
    console.error("App starting error:", err.message);
    process.exit(1);
});

var insert = async function(model, objs) {
    for (var obj of objs) {
        let entry = new model(obj);
        await entry.save();
    }
}

function k_combinations(set, k) {
  // RETURN SET CHOOSE K ENTRIES
	var i, j, combs, head, tailcombs;

	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0) {
		return [];
	}

	// K-sized set has only one K-sized subset.
	if (k == set.length) {
		return [set];
	}

	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
      u = [set[i]];
      u.sort();
      if (u[1] == "WETH"){
        u = [u[1],u[0]]
      }
			combs.push(u);
		}
		return combs;
	}

	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++) {
      u = head.concat(tailcombs[j]);
      u.sort();
      if (u[1] == "WETH"){
        u = [u[1],u[0]]
      }
			combs.push(u);
		}
	}
	return combs;
}

async function tokenMaker(exchange, tokens, tokenName, chain, tokenAmount=0) {

  /***
  * @param {string} tokenName is token
  *
  * @returns {Object} token object
  ***/

  if (tokenName == "ETH") {
    tokenName = "WETH";
  }
  if (exchange == "uniswap") {
    const token_ = await (new uniswap.Token(uniswap.ChainId[chain], tokens[tokenName].address, 18, tokenName));
    const tokenAmount_ = await (new uniswap.TokenAmount(token_, tokenAmount));
    return tokenAmount_;
  } else if (exchange == "sushiswap") {
    const token_ = await (new sushiswap.Token(uniswap.ChainId[chain], tokens[tokenName].address, 18, tokenName));
    const tokenAmount_ = await (new sushiswap.TokenAmount(token_, tokenAmount));
    return tokenAmount_;
  }

}

async function pairMaker(exchange, tokens, tokenA, tokenB, amountA, amountB, chain) {

  /***
  * @param {string} tokenA is token,
  * @param {string} tokenB is token
  *
  * @returns {Object} pair object
  ***/

  if (tokenA == "ETH") {
    tokenA = "WETH";
  }
  assert(tokenB != "WETH", "tokenB must not be ETH");
  const tokenA_ = await tokenMaker(exchange, tokens, tokenA, chain, amountA);
  const tokenB_ = await tokenMaker(exchange, tokens, tokenB, chain, amountB);
  if (exchange == "uniswap") {
    return await (new uniswap.Pair(tokenA_, tokenB_));
  } else if (exchange == "sushiswap") {
    return await (new sushiswap.Pair(tokenA_, tokenB_));
  }
}

async function populateLPs() {
  const tokensData = (await TokenModel.find());
  const chains = ["MAINNET","RINKEBY","KOVAN"];
  const exchanges = ["uniswap", "sushiswap"];

  var tokensTemp = {};
  for (var token of tokensData) {
    if (token["MAINNET"] != "0x0") {
      tokensTemp[token.name] = { "decimal": token.decimal, "address": token["MAINNET"] };
    }
  }
  console.log(tokensTemp);
  //console.log(Object.keys(tokensTemp).filter(function(a){return a[0] !== 'c'}));
  list = Object.keys(tokensTemp).filter(function(a){return a[0] !== 'c'});
  const lpPairs = k_combinations(list,2);

  var tokensOutput = {};
  for (const exchange of exchanges) {
    for (const lpPair of lpPairs) {
      var symbol = lpPair[0]+'_'+lpPair[1]+"_"+exchange;
      tokensOutput[symbol] = {}
    }
  }

  for (const exchange of exchanges) {
    for (const chain of chains) {
      var tokensTemp = {};
      for (var token of tokensData) {
        if (token[chain] != "0x0") {
          tokensTemp[token.name] = { "decimal": token.decimal, "address": token[chain] };
        }
      }
      //console.log(tokens);
      for (const lpPair of lpPairs) {
        const pairs = (await pairMaker(exchange, tokensTemp,lpPair[0],lpPair[1],0,0,chain));
        const symbol = lpPair[0]+'_'+lpPair[1]+"_"+exchange;
        if (chain == "MAINNET") {
          tokensOutput[symbol]["description"] = symbol;
          tokensOutput[symbol]["decimal"] = pairs.liquidityToken.decimals;
        }
        tokensOutput[symbol][chain] = pairs.liquidityToken.address;
      }
    }
  }
  tokenArr = []
  for (var token of Object.keys(tokensOutput)) {
    var temp = tokensOutput[token];
    temp['name'] = token;
    tokenArr.push(temp);
  }
  await insert(TokenModel, tokenArr);
  console.log("LP Tokens successfully populated");
}
module.exports.populateLPs = populateLPs;
