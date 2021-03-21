
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// global variables
const privateKey = "266e434cda4f885e365c13224c11b12888f6e55a8488a904a71295e8ff9622ad";
const infuraURI = "https://rinkeby.infura.io/v3/eb8d27a5b3d24313b6d8a13e56464ce3";
const provider = new HDWalletProvider(privateKey, infuraURI);
const web3 = new Web3(provider);

var walletAddress = "0xD93ec03787218Ea08EA3AAf36064A0f7F62543A4";
var ethBalance = web3.eth.getBalance(walletAddress).then((value) => {
    console.log(value);
});