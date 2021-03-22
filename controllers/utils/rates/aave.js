const UserModel = require('../../../models/UserModel');
const TokenModel = require('../../../models/TokenModel');

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { token } = require('../../DataController');

const utils = require('../utils');
const CHAIN = "kovan";

// global variables
//const infuraURI = process.env.INFURA_URI;
const infuraURI = "https://kovan.infura.io/v3/94e5a7cfc58b43bd9ee231d771ef2e67";
//const erc20ABIFpath = process.env.ERC20_ABI_FPATH;

//let IERC20 = fs.readFileSync(erc20ABIFpath);
//IERC20 = JSON.parse(IERC20).abi;

const ethDecimals = 18; // Ethereum has 18 decimal places
const underlyingDecimals = 18; // TODO: works for DAI at least

const aaveCoins = ["DAI","USDC","ETH","BAT"];

//const aTokenAbi = require('../../../contracts/AToken.json');
//const lendPoolAbi = require('../../../contracts/LendingPool.json');
//const lendPoolAddrProv = require('../../../contracts/LendingPoolAddressesProvider.json');
//const lendPoolCore = require('../../../contracts/LendingPoolCore.json');
//const wETHGateway = require("../../../contracts/WETHGateway.json");

// get coin decimals
var tokenInfo;
var loadTokens = async function() {
    var tokens = {};
    const tokensData = (await TokenModel.find());
    const ercContract = require("../../../contracts/IERC20.json"); // eth abi
    const web3 = new Web3();
    for (var token of tokensData) {
      if (token[CHAIN] != "0x0"){
        tokens[token.name] = { "decimal": token.decimal, "address": token[CHAIN], "contract": new web3.eth.Contract(ercContract.abi, token[CHAIN]) };
      } else {
        var entry = { "decimal": token.decimal, "address": token[CHAIN], "contract": "" };
        tokens[token.name] = entry;//{ "decimal": String(token.decimal), "address": token[CHAIN], "contract": "" };
      }
    }
    return tokens;
}
// TODO: why does async await not work here
loadTokens().then((info) => {
    tokenInfo = info
});