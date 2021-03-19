const UserModel = require("../../models/UserModel");
const TokenModel = require("../../models/TokenModel");

const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const Web3 = require('web3');
const { urlencoded } = require("express");

// global variables
const privateKey = process.env.PRIVATE_KEY;
const infuraURI = process.env.INFURA_URI;
const erc20ABIFpath = process.env.ERC20_ABI_FPATH;

let IERC20 = fs.readFileSync(erc20ABIFpath);
IERC20 = JSON.parse(IERC20).abi;

const provider = new HDWalletProvider(privateKey, infuraURI);
const web3 = new Web3(provider);

exports.createWallet = function() {
    var account = web3.eth.accounts.create();
    return account;
}

// IDs get passed as ObjectID
// TODO: resolve or just use email?
exports.getBalances = async function(user) {
    var walletAddress = user.localAddress;
    result = {};

    // get ETH balance
    var ethBalance = await web3.eth.getBalance(walletAddress);
    result["ETH"] = ethBalance;

    // get token balances
    var tokens = await TokenModel.find();
    for (var token of tokens) {
        if (token != "ETH") {
            let name = token.name;
            let address = token.address;
            // TODO: save 
            let tokenInst = new web3.eth.Contract(IERC20, address);
            let balance = await tokenInst.methods.balanceOf(walletAddress).call();
            result[name] = balance;
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
        result["ETH"] = ethBalance;
    } else {
        let token = await TokenModel.findOne({name: tokenName});
        let tokenInst = new web3.eth.Contract(IERC20, token.address);
        let balance = await tokenInst.methods.balanceOf(walletAddress).call();
        result[tokenName] = balance;
    }
    return result;
}
