const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// global variables
const privateKey = process.env.PRIVATE_KEY;
const infuraURI = process.env.INFURA_URI;
const provider = new HDWalletProvider(privateKey, infuraURI);
const web3 = new Web3(provider);

exports.createWallet = function() {
    var account = web3.eth.accounts.create();
    return account;
}