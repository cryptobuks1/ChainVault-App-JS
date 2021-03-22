require("dotenv").config();
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN = process.env.CHAIN;
const INFURA_URI = process.env.INFURA_URI;
const UNISWAP = require('@uniswap/sdk')

const Web3 = require("web3");
const HDWalletProvider = require('truffle-hdwallet-provider');
const provider = new HDWalletProvider(PRIVATE_KEY, INFURA_URI);
const web3 = new Web3(provider);

const TokenModel = require("../../../models/TokenModel");
const ContractModel = require("../../../models/ContractModel");
const routerContract = require("../../../contracts/IUniswapV2Router02.json"); // uni abi
const ercContract = require("../../../contracts/IERC20.json"); // eth abi

var UNIGRAPH_URI;
var SUSHIGRAPH_URI;

var tokens = {};
var contracts = {};


async function main() {
  /// RINKEBY TESTNET ENDPOINTS
  UNIGRAPH_URI = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
  SUSHIGRAPH_URI = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

  const contractsData = (await ContractModel.find());
  for (var contract of contractsData) {
      contracts[contract.name] = { "address": contract[CHAIN] };
  }

  const tokensData = (await TokenModel.find());
  for (var token of tokensData) {
    if (token[CHAIN] != "0x0") {
      tokens[token.name] = { "decimal": token.decimal, "address": token[CHAIN], "contract": new web3.eth.Contract(ercContract.abi, token[CHAIN]) };
    } else {
      tokens[token.name] = { "decimal": token.decimal, "address": token[CHAIN], "contract": "" };
    }
  }
  tokens["WETH"] = { "decimal": 18, "address": UNISWAP.WETH[UNISWAP.ChainId[CHAIN]].address };
}
main();


module.exports.PUBLIC_KEY = process.env.PUBLIC_KEY;
module.exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports.CHAIN = process.env.CHAIN;
module.exports.INFURA_URI = process.env.INFURA_URI;
module.exports.routerContract = routerContract;
module.exports.ercContract = ercContract;
module.exports.UNIGRAPH_URI = UNIGRAPH_URI;
module.exports.SUSHIGRAPH_URI = SUSHIGRAPH_URI;
module.exports.contracts = contracts;
module.exports.tokens = tokens;
module.exports.web3 = web3;
