require("dotenv").config();
const MNEMONIC = process.env.MNEMONIC;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = process.env.CHAIN;
const INFURA_URI = process.env.INFURA_URI;
const UNISWAP = require('@uniswap/sdk')

const Web3 = require("web3");
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = process.env.mnemonic
const provider = new HDWalletProvider(MNEMONIC, INFURA_URI);
const web3 = new Web3(provider);

const routerContract = require("../../../contracts/IUniswapV2Router02.json"); // uni abi
const ercContract = require("../../../contracts/IERC20.json"); // eth abi
const TokenModel = require("../../../models/TokenModel");
///const ContractModel = require("../models/ContractModel");

var UNIGRAPH_URI;
var SUSHIGRAPH_URI;
var ADDRESS_UNI_ROUTER;
var uniRouterContract;
var sushiRouterContract;
var tokens = {};


async function main() {
  /// RINKEBY TESTNET ENDPOINTS
  const ADDRESS_UNI_ROUTER = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"; // UNISWAP address
  uniRouterContract = new web3.eth.Contract(routerContract.abi, ADDRESS_UNI_ROUTER); // router contract
  const ADDRESS_SUSHI_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"; // UNISWAP address
  sushiRouterContract = new web3.eth.Contract(routerContract.abi, ADDRESS_SUSHI_ROUTER); // router contract

  UNIGRAPH_URI = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
  SUSHIGRAPH_URI = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

  const tokensData = (await TokenModel.find());
  for (var token of tokensData) {
    if (token[CHAIN] != "0x0"){
      tokens[token.name] = { "decimal": token.decimal, "address": token[CHAIN], "contract": new web3.eth.Contract(ercContract.abi, token[CHAIN]) };
    } else{
      var entry = { "decimal": token.decimal, "address": token[CHAIN], "contract": "" };
      tokens[token.name] = entry;//{ "decimal": String(token.decimal), "address": token[CHAIN], "contract": "" };
    }
  }
  tokens["WETH"] = { "decimal": 18, "address": UNISWAP.WETH[UNISWAP.ChainId[CHAIN]].address };
}
main();


module.exports.MNEMONIC = process.env.MNEMONIC;
module.exports.PUBLIC_KEY = process.env.PUBLIC_KEY;
module.exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports.CHAIN = process.env.CHAIN;
module.exports.INFURA_URI = process.env.INFURA_URI;
module.exports.UNIGRAPH_URI = UNIGRAPH_URI;
module.exports.SUSHIGRAPH_URI = SUSHIGRAPH_URI;
module.exports.uniRouterContract = uniRouterContract;
module.exports.sushiRouterContract = sushiRouterContract;
module.exports.tokens = tokens;
module.exports.web3 = web3;
