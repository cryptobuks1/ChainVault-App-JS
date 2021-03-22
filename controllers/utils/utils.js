const UserModel = require("../../models/UserModel");
const TokenModel = require("../../models/TokenModel");

const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const Web3 = require('web3');
const { urlencoded } = require("express");

// global variables
const privateKey = process.env.PRIVATE_KEY;
const infuraURI = process.env.INFURA_URI;

const {
    cEthAbi,
    comptrollerAbi,
    priceFeedAbi,
    cErcAbi,
    erc20Abi,
} = require('../../contracts/Compound.json');

const provider = new HDWalletProvider(privateKey, infuraURI);
const web3 = new Web3(provider);
const CHAIN = 'rinkeby';

var selectChain = function(tokenObj, chain) {
    switch(chain) {
        case "main":
            return tokenObj.MAINNET;
            break;
        case "rinkeby":
            return tokenObj.RINKEBY;
            break;
        case "kovan":
            return tokenObj.KOVAN;
            break;
        default:
            return tokenObj.RINKEBY;
    }
}
exports.selectChain = selectChain;

// get coin decimals
var tokenInfo;
var loadTokens = async function() {
    var tokenInfo = {};
    var tokens = await TokenModel.find();
    for (var token of tokens) {
        tokenInfo[token.name] = {"decimal": token.decimal, "address": selectChain(token, CHAIN)}
    }
    return tokenInfo;
}
// TODO: why does async await not work here
loadTokens().then((info) => {
    tokenInfo = info
});

exports.createWallet = function() {
    var account = web3.eth.accounts.create();
    return account;
}

// TODO: make the calls more modular

// IDs get passed as ObjectID
// TODO: resolve or just use email?
exports.getBalances = async function(user) {

    var walletAddress = user.localAddress;
    result = {};

    // get ETH balance
    var ethBalance = await web3.eth.getBalance(walletAddress);
    ethBalance /= Math.pow(10, tokenInfo["ETH"]["decimal"]);
    result["ETH"] = ethBalance
    // get token balances
    for (var token of Object.keys(tokenInfo)) {
        console.log(token);
        if (token != "ETH") {
            let address = tokenInfo[token]["address"];;
            console.log(address);
            // TODO: save
            let tokenInst = new web3.eth.Contract(erc20Abi, address);
            let balance = await tokenInst.methods.balanceOf(walletAddress).call();
            console.log(balance);
            balance /= Math.pow(10, tokenInfo[token]["decimal"]);
            result[token] = balance;
        }
    }

    return result;
}

// IDs get passed as ObjectID
exports.getBalance = async function(user, tokenName) {

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
