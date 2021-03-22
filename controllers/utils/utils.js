require("dotenv").config();
const CHAIN = process.env.CHAIN;
const infuraURI = process.env.INFURA_URI;

const { UserModel } = require("../../models/UserModel");
const { TokenModel } = require("../../models/TokenModel");

const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const Web3 = require('web3');
const { urlencoded } = require("express");

// global variables
const privateKey = process.env.PRIVATE_KEY;
const provider = new HDWalletProvider(privateKey, infuraURI);
const web3Dummy = new Web3(provider);

async function web3User(user) {
  const userSearch = await UserModel.findOne({email: user.email});
  const privateKey = userSearch.localPrivateKey;
  const provider = new HDWalletProvider(privateKey, infuraURI);
  const web3 = new Web3(provider);
  return web3;
}

const {
    cEthAbi,
    comptrollerAbi,
    priceFeedAbi,
    cErcAbi,
    erc20Abi,
  } = require('../../contracts/Compound.json');

// get coin decimals
var tokenInfo;
var loadTokens = async function() {
    var tokens = {};
    const tokensData = (await TokenModel.find());
    for (var token of tokensData) {
      if (token[CHAIN] != "0x0"){
        tokens[token.name] = { "decimal": token.decimal, "address": token[CHAIN], "contract": new web3Dummy.eth.Contract(erc20Abi, token[CHAIN]) };
      } else{
        var entry = { "decimal": token.decimal, "address": token[CHAIN], "contract": "" };
        tokens[token.name] = entry;//{ "decimal": String(token.decimal), "address": token[CHAIN], "contract": "" };
      }
    }
    return tokens;
}
loadTokens().then((info) => {
    tokenInfo = info
});

exports.createWallet = function() {
    var account = web3Dummy.eth.accounts.create();
    return account;
}

// TODO: make the calls more modular

// IDs get passed as ObjectID
// TODO: resolve or just use email?
exports.getBalances = async function(user) {
    const privateKey = process.env.PRIVATE_KEY;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    var walletAddress = user.localAddress;
    result = {};

    // get ETH balance
    var ethBalance = await web3.eth.getBalance(walletAddress);
    ethBalance /= Math.pow(10, tokenInfo["ETH"]["decimal"]);
    result["ETH"] = ethBalance

    // get token balances
    for (var token of Object.keys(tokenInfo)) {
        if (token != "ETH") {
            let address = tokenInfo[token]["address"];;
            // TODO: save
            if (address == "0x0") {
              continue;
            }
            let tokenInst = new web3.eth.Contract(erc20Abi, address);
            let balance = await tokenInst.methods.balanceOf(walletAddress).call();
            balance /= Math.pow(10, tokenInfo[token]["decimal"]);
            result[token] = balance;
        }
    }

    return result;
}

// IDs get passed as ObjectID
exports.getBalance = async function(user, tokenName) {

    const privateKey = process.env.PRIVATE_KEY;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    var walletAddress = user.localAddress;
    result = {};

    // get ETH balance
    if (tokenName == "ETH") {
        var ethBalance = await web3.eth.getBalance(walletAddress);
        ethBalance /= Math.pow(10, tokenInfo[tokenName]["decimal"]);
        result["ETH"] = ethBalance;
    } else {
        let tokenInst = new web3.eth.Contract(erc20Abi, tokenInfo[tokenName]["address"]);
        let balance = await tokenInst.methods.balanceOf(walletAddress).call();
        balance /= Math.pow(10, tokenInfo[tokenName]["decimal"]);
        result[tokenName] = balance;
    }
    return result;
}

exports.approveTransfer = async function(user, targetAddress, tokenName, amount) {

  web3 = await web3User(user);
  tx = { from: user.localAddress, to: targetAddress };
  result = (await tokenInfo[tokenName]["contract"].methods.approve(targetAddress, web3.utils.toWei(amount, "ether")).send(tx));
  return result;
}
exports.web3User = web3User;
