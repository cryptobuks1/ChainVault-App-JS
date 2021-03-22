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

const aTokenAbi = require('../../../contracts/AToken.json');
const lendPoolAbi = require('../../../contracts/LendingPool.json');
const lendPoolAddrProv = require('../../../contracts/LendingPoolAddressesProvider.json');
const lendPoolCore = require('../../../contracts/LendingPoolCore.json');
const wETHGateway = require("../../../contracts/WETHGateway.json");

// get coin decimals
var tokenInfo;
var loadTokens = async function() {
    var tokenInfo = {};
    var tokens = await TokenModel.find();
    for (var token of tokens) {
        tokenInfo[token.name] = {"decimal": token.decimal, "address": utils.selectChain(token, CHAIN)}
    }
    return tokenInfo;
}
// TODO: why does async await not work here
loadTokens().then((info) => {
    tokenInfo = info
});


exports.lendETH = async function(user, amount) {

    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    // Loading the lending pool instance. TODO: automate
    const lendPoolAddress = "0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5";
    const providerInstance = new web3.eth.Contract(lendPoolAddrProv, lendPoolAddress);
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
    .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`)
    });
    const lendingPoolInstance = new web3.eth.Contract(lendPoolAbi, lendingPoolAddress);

    amount = amount * Math.pow(10, ethDecimals);
    amount = parseInt(amount);
    var walletAddress = user.localAddress;

    lendingPoolInstance.methods.deposit(
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amount, 0).send({from: walletAddress, value: web3.utils.toHex(amount)})
          .once('transactionHash', (hash) => {
              console.log(hash);
          })
          .on('confirmation', (number, receipt) => {
              // number of confirmations
              console.log(receipt);
          })
          .on('error', (error) => {
              console.log(error);
          });
}