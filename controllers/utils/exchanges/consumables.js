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
const ercContract = require("../../../contracts/ICERC20.json"); // eth abi

/// RINKEBY TESTNET ENDPOINTS
const ADDRESS_UNI_ROUTER = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"; // UNISWAP address
const uniRouterContract = new web3.eth.Contract(routerContract.abi, ADDRESS_UNI_ROUTER); // router contract
const ADDRESS_DAI = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735" // DAI address
const daiContract = new web3.eth.Contract(ercContract.abi, ADDRESS_DAI); // DAI contract
const ADDRESS_MKR = "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85"; // MKR address
const mkrContract = new web3.eth.Contract(ercContract.abi, ADDRESS_MKR); // MKR contract
const ADDRESS_WETH = UNISWAP.WETH[UNISWAP.ChainId[CHAIN]].address // WETH address
const ADDRESS_UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
const uniContract = new web3.eth.Contract(ercContract.abi, ADDRESS_UNI); // UNI contract
const ADDRESS_ETHDAI_UNILP = "0x8B22F85d0c844Cf793690F6D9DFE9F11Ddb35449";
const ethDaiContract = new web3.eth.Contract(ercContract.abi, ADDRESS_ETHDAI_UNILP); // DAI contract
const ADDRESS_DAIMKR_UNILP = "0x50dE2f1AF8065CfE8524e86d59f4D4F755feb6f6";
const daiMkrContract = new web3.eth.Contract(ercContract.abi, ADDRESS_DAIMKR_UNILP); // DAI contract
const ADDRESS_ETHUNI_UNILP = "0x3D8051F7c057d1b77b27D8DbBE638EAff0359EAa";
const ethUniContract = new web3.eth.Contract(ercContract.abi, ADDRESS_ETHUNI_UNILP); // DAI contract

addresses = {"DAI": ADDRESS_DAI, "MKR": ADDRESS_MKR,  "UNI": ADDRESS_UNI,
             "ETH": ADDRESS_WETH, "ETH-DAI_UNILP": ADDRESS_ETHDAI_UNILP, "DAI-MKR_UNILP": ADDRESS_DAIMKR_UNILP};

module.exports.MNEMONIC = process.env.MNEMONIC;
module.exports.PUBLIC_KEY = process.env.PUBLIC_KEY;
module.exports.PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports.CHAIN = process.env.CHAIN;
module.exports.INFURA_URI = process.env.INFURA_URI;
module.exports.ADDRESS_UNI_ROUTER = ADDRESS_UNI_ROUTER;
module.exports.daiContract = daiContract;
module.exports.mkrContract = mkrContract;
module.exports.uniContract = uniContract;
module.exports.ethDaiContract = ethDaiContract;
module.exports.daiMkrContract = daiMkrContract;
module.exports.ethUniContract = ethUniContract;
module.exports.uniRouterContract = uniRouterContract;
module.exports.addresses = addresses;
module.exports.web3 = web3;
