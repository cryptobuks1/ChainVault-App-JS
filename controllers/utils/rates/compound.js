require("dotenv").config();
const CHAIN = process.env.CHAIN;

const UserModel = require('../../../models/UserModel');
const TokenModel = require('../../../models/TokenModel');
const ContractModel = require('../../../models/ContractModel');

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { token } = require('../../DataController');

// global variables
//const infuraURI = process.env.INFURA_URI;
const infuraURI = "https://rinkeby.infura.io/v3/eb8d27a5b3d24313b6d8a13e56464ce3";
//const erc20ABIFpath = process.env.ERC20_ABI_FPATH;

//let IERC20 = fs.readFileSync(erc20ABIFpath);
//IERC20 = JSON.parse(IERC20).abi;

const ethDecimals = 18; // Ethereum has 18 decimal places
const compoundCoins = ["DAI","USDC","BAT","ETH","USDT","ZRX"];

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

// TODO: add the interest rate achieved in the output
exports.lendETH = async function(user, amount) {

    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    var cETH = await TokenModel.findOne({name: "cETH"});
    const cEthContract = new web3.eth.Contract(cEthAbi, cETH[CHAIN]);

    var walletAddress = user.localAddress;
    let ethBalance = await web3.eth.getBalance(walletAddress) / Math.pow(10, ethDecimals);
    console.log("My wallet's ETH balance:", ethBalance, '\n');

    let supplyRate = await cEthContract.methods.supplyRatePerBlock().call();
    supplyRate = supplyRate / 1e18;

    console.log('Supplying ETH to the Compound Protocol...', '\n');
    // Mint some cETH by supplying ETH to the Compound Protocol
    var txn = await cEthContract.methods.mint().send({
        from: walletAddress,
        gasLimit: web3.utils.toHex(150000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: web3.utils.toHex(web3.utils.toWei(String(amount), 'ether'))
    });

    console.log('cETH "Mint" operation successful.', '\n');

    const balanceOfUnderlying = web3.utils.toBN(await cEthContract.methods
    .balanceOfUnderlying(walletAddress).call()) / Math.pow(10, ethDecimals);

    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying, '\n');

    let cTokenBalance = await cEthContract.methods.balanceOf(walletAddress).call() / 1e8;

    console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');
    return {cETH: cTokenBalance, supplyRate: supplyRate, txn: txn};
}

exports.redeemETH = async function(user, amount) {

    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    var cETH = await TokenModel.findOne({ name: "cETH" });
    var walletAddress = user.localAddress;

    // TODO: ADD checks on amount to be loaned etc
    const cEthContract = new web3.eth.Contract(cEthAbi, cETH[CHAIN]);
    let currEthBalance = await web3.eth.getBalance(walletAddress) / Math.pow(10, ethDecimals);
    let exchangeRateCurrent = await cEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8);
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent, '\n');

    console.log('Redeeming the cETH for ETH...', '\n');

    console.log('Exchanging all cETH based on cToken amount...', '\n');
    var txn = await cEthContract.methods.redeem(amount * 1e8).send({
      from: walletAddress,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    cTokenBalance = await cEthContract.methods.balanceOf(walletAddress).call() / 1e8;
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    let finalEthBalance = await web3.eth.getBalance(walletAddress) / Math.pow(10, ethDecimals);
    console.log("My wallet's ETH balance:", finalEthBalance, '\n');
    let ethCreated = (finalEthBalance - currEthBalance);

    return {ethCreated: ethCreated, txn: txn};
}

exports.lendERC20 = async function(user, tokenName, amount) {

    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    var walletAddress = user.localAddress;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    var cTokenName = "c"+tokenName;
    var token = await TokenModel.findOne({name: tokenName});
    var cToken = await TokenModel.findOne({name: cTokenName});
    const underlyingDecimals = token.decimal;

    amount = amount * Math.pow(10, underlyingDecimals)

    const cTokenContractAddress = cToken[CHAIN];
    const cTokenContract = new web3.eth.Contract(cErcAbi, cTokenContractAddress);

    // Mainnet Contract for the underlying token https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f
    // When using cDAI, give your local test net wallet some DAI using `node seed-account-with-erc20/dai.js`
    const underlyingContractAddress = token[CHAIN];
    const underlyingContract = new web3.eth.Contract(erc20Abi, underlyingContractAddress);

    // Tell the contract to allow 10 tokens to be taken by the cToken contract
    await underlyingContract.methods.approve(
        cTokenContractAddress, web3.utils.toBN(amount)
    ).send({from: walletAddress});

    let supplyRate = await cTokenContract.methods.supplyRatePerBlock().call();
    supplyRate = supplyRate / 1e18;

    console.log(`${tokenName} contract "Approve" operation successful.`);
    console.log(`Supplying ${tokenName} to the Compound Protocol...`, '\n');

    // Mint cTokens by supplying underlying tokens to the Compound Protocol
    var txn = await cTokenContract.methods.mint(
        web3.utils.toBN(amount.toString())
    ).send({from: walletAddress});

    console.log(`c${tokenName} "Mint" operation successful.`, '\n');

    const balanceOfUnderlying = web3.utils.toBN(await cTokenContract.methods
        .balanceOfUnderlying(walletAddress).call()) / Math.pow(10, underlyingDecimals);

    console.log(`${tokenName} supplied to the Compound Protocol:`, balanceOfUnderlying, '\n');

    let cTokenBalance = await cTokenContract.methods.
        balanceOf(walletAddress).call() / 1e8;
    console.log(`My wallet's c${tokenName} Token Balance:`, cTokenBalance);

    let underlyingBalance = await underlyingContract.methods.balanceOf(walletAddress).call();
    underlyingBalance = underlyingBalance / Math.pow(10, underlyingDecimals);
    console.log(`My wallet's ${tokenName} Token Balance:`, underlyingBalance, '\n');

    return {[cTokenName]: cTokenBalance, supplyRate: supplyRate, txn: txn}
}

exports.redeemERC20 = async function(user, tokenName, amount) {

    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    var walletAddress = user.localAddress;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    var cTokenName = "c"+tokenName;
    var token = await TokenModel.findOne({name: tokenName});
    var cToken = await TokenModel.findOne({name: cTokenName});
    const cTokenContractAddress = cToken[CHAIN];
    const cTokenContract = new web3.eth.Contract(cErcAbi, cTokenContractAddress);
    const underlyingDecimals = token.decimal;

    // Mainnet Contract for the underlying token https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f
    // When using cDAI, give your local test net wallet some DAI using `node seed-account-with-erc20/dai.js`
    const underlyingContractAddress = token[CHAIN];
    const underlyingContract = new web3.eth.Contract(erc20Abi, underlyingContractAddress);

    let currWalletBalance = await underlyingContract.methods.balanceOf(walletAddress).call();
    currWalletBalance = currWalletBalance / Math.pow(10, underlyingDecimals);

    let erCurrent = await cTokenContract.methods.exchangeRateCurrent().call();
    let exchangeRate = erCurrent / Math.pow(10, 18 + underlyingDecimals - 8);
    console.log(`Current exchange rate from c${tokenName} to ${tokenName}:`, exchangeRate, '\n');
    console.log(`Redeeming the c${tokenName} for ${tokenName}...`);

    // redeem (based on underlying)
    console.log(`Exchanging all c${tokenName} based on underlying ${tokenName} amount...`);
    let underlyingAmount = web3.utils.toBN(amount * Math.pow(10, underlyingDecimals));
    var txn = await cTokenContract.methods.redeemUnderlying(underlyingAmount).send({ from: walletAddress });

    let finalWalletBalance = await underlyingContract.methods.balanceOf(walletAddress).call();
    finalWalletBalance = finalWalletBalance / Math.pow(10, underlyingDecimals);
    console.log(`My wallet's ${tokenName} Token Balance:`, finalWalletBalance, '\n');

    let tokenCreated = finalWalletBalance - currWalletBalance;
    return { tokenCreated: tokenCreated, txn: txn};
}

const {
  cEthAbi,
  comptrollerAbi,
  priceFeedAbi,
  cErcAbi,
  erc20Abi,
} = require('../../../contracts/Compound.json');

const logBalances = (tokenName, web3, cToken, underlying, walletAddress) => {
    return new Promise(async (resolve, reject) => {
      let tokenObj = await TokenModel.findOne({ name: tokenName });
      let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(walletAddress));
      let myWalletCTokenBalance = await cToken.methods.balanceOf(walletAddress).call() / 1e8;
      let myWalletUnderlyingBalance = +await underlying.methods.balanceOf(walletAddress).call() / Math.pow(10, tokenObj.decimal);

      console.log(`My Wallet's  ETH Balance:`, myWalletEthBalance);
      console.log(`My Wallet's c${tokenName} Balance:`, myWalletCTokenBalance);
      console.log(`My Wallet's  ${tokenName} Balance:`, myWalletUnderlyingBalance);

      resolve();
    });
};

// TODO: make cleaner. amount = 0 means no mint, just supply.
// TODO: should I get rid of the creation feature?
exports.supplyCollateral = async function(user, tokenNames, amounts) {

    const compContract = await ContractModel.findOne({ name: "COMP_COMPTROLLER" });
    const comptrollerAddress = compContract[CHAIN];
    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);
    
    var cTokensAddresses = [];
    for (i = 0; i < tokenNames.length; i++) {
        let tokenName = tokenNames[i];
        let amount = amounts[i];

        var cTokenObj = await TokenModel.findOne({name: "c"+tokenName});
        const cTokenAddress = cTokenObj[CHAIN];
        cTokensAddresses.push(cTokenAddress);

        var cTokenAmount;
        if (amount > 0) {
            if (tokenName == "ETH") {
                cTokenAmount = await this.lendETH(user, amount);
            } else {
                cTokenAmount = await this.lendERC20(user, tokenName, amount);
            }
        }
    }

    console.log('\nEntering market (via Comptroller contract) for ETH (as collateral)...');
    let markets = cTokensAddresses; // This is the cToken contract(s) for your collateral
    let enterMarkets = await comptroller.methods.enterMarkets(markets).send({ from: walletAddress });

    var collat = await this.collateral(user);
    return { collat: collat, txn: enterMarkets };
}

exports.removeCollateral = async function(user, tokenNames) {

    const compContract = await ContractModel.findOne({ name: "COMP_COMPTROLLER" });
    const comptrollerAddress = compContract[CHAIN];
    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

    var txns = []
    for (var tokenName of tokenNames) {
        var cTokenObj = await TokenModel.findOne({name: "c"+tokenName});
        const cTokenAddress = cTokenObj[CHAIN];
        const cTokenName = cTokenObj.name;

        console.log('\Exiting market (via Comptroller contract) for ETH (as collateral)...');
        let exitMarket = await comptroller.methods.exitMarket(cTokenAddress).send({ from: walletAddress });
        txns.push(exitMarket);
    }

    var collat = await this.collateral(user);
    return { collat: collat, txn: txns };
}

// List the liquidty. TODO: get the tokens used as collateral.
// List markets in
exports.collateral = async function(user) {

    const compContract = await ContractModel.findOne({ name: "COMP_COMPTROLLER" });
    const comptrollerAddress = compContract[CHAIN];
    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

    const markets = await comptroller.methods.getAssetsIn(walletAddress).call();
    console.log(markets);

    var cFactors = [];
    for (let cTokenAddress of markets) {
        let {1:collateralFactor} = await comptroller.methods.markets(cTokenAddress).call();
        // get token object from cTokenAddress
        const cTokenObj = await TokenModel.findOne({ [CHAIN]: cTokenAddress });
        const tokenObj = await TokenModel.findOne({ name: cTokenObj.name.substring(1) });
        collateralFactor = (collateralFactor / Math.pow(10, tokenObj.decimal)) * 100; // Convert to percent
        cFactors.push(collateralFactor);
    }

    console.log('Calculating your liquid assets in the protocol...');
    let {1:liquidity} = await comptroller.methods.getAccountLiquidity(walletAddress).call();
    liquidity = web3.utils.fromWei(liquidity).toString();

    return {markets: markets, liquidity: liquidity, cFactors: cFactors};
}

exports.borrowETH = async function(user, amount) {

    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    const cETH = await TokenModel.findOne({ name: "cETH" });
    const cEth = new web3.eth.Contract(cEthAbi, cETH[CHAIN]);

    console.log('Fetching borrow rate per block for ETH borrowing...');
    let borrowRate = await cEth.methods.borrowRatePerBlock().call();
    borrowRate = borrowRate / 1e18;

    // Add this back with other functions
    //console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
    //console.log(`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to the protocol as ETH.`);
    //console.log(`1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`);
    //console.log(`You can borrow up to ${liquidity} USD worth of assets from the protocol.`);
    //console.log(`NEVER borrow near the maximum amount because your account will be instantly liquidated.`);
    //console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block.\nThis is based on the current borrow rate.`);

    // Let's try to borrow 0.02 ETH (or another amount far below the borrow limit)
    console.log(`\nNow attempting to borrow ${amount} ETH...`);
    const borrowResult = await cEth.methods.borrow(web3.utils.toWei(amount.toString(), 'ether')).send({ from: walletAddress });

    if (isNaN(borrowResult)) {
      console.log(`\nETH borrow successful.\n`);
    } else {
      throw new Error(
        `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
        `Code: ${borrowResult}\n`
      );
    }
    var balances = await this.borrowBalances(user);
    return {"balances": balances, borrowRate: borrowRate, txn: borrowResult };
}

exports.borrowBalances = async function(user) {

    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    var tokenNames = Object.keys(tokenInfo);

    var balances = {}
    for (var tokenName of tokenNames) {
        if ((tokenName[0] != "c") && (compoundCoins.includes(tokenName))) {
            const cTokenObj = await TokenModel.findOne({name: "c"+tokenName});
            const tokenObj = await TokenModel.findOne({ name: tokenName});
            var cToken;
            if (tokenName == "ETH") {
                cToken = new web3.eth.Contract(cEthAbi, cTokenObj[CHAIN]);
            } else {
                cToken = new web3.eth.Contract(cErcAbi, cTokenObj[CHAIN]);
            }
            console.log('\nFetching your borrow balance from contract...');
            let balance = await cToken.methods.borrowBalanceCurrent(walletAddress).call();
            balance = balance / Math.pow(10, tokenObj.decimal); // because DAI is a 1e18 scaled token.
            balances[tokenName] = balance;
        }
    }

    return balances;
}

exports.repayETH = async function(user, amount) {

    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    const cETH = await TokenModel.findOne({ name: "cETH" });
    const cEth = new web3.eth.Contract(cEthAbi, cETH[CHAIN]);

    const repayBorrow = await cEth.methods.repayBorrow().send({
        from: walletAddress,
        gasLimit: web3.utils.toHex(600000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: web3.utils.toWei(amount.toString(), 'ether')
    });

    if (repayBorrow.events && repayBorrow.events.Failure) {
        const errorCode = repayBorrow.events.Failure.returnValues.error;
        console.error(`repayBorrow error, code ${errorCode}`);
        process.exit(1);
    }
    var balances = await this.borrowBalances(user);
    return { balances: balances, txn: repayBorrow };
}

exports.borrowERC20 = async function(user, tokenName, amount) {

    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);

    var cTokenName = "c"+tokenName;
    var token = await TokenModel.findOne({name: tokenName});
    var cToken = await TokenModel.findOne({name: cTokenName});
    const cTokenContract = new web3.eth.Contract(cErcAbi, cToken[CHAIN]);
    const underlyingDecimals = token.decimal;

    console.log(`Fetching borrow rate per block for ${tokenName} borrowing...`);
    let borrowRate = await cTokenContract.methods.borrowRatePerBlock().call();
    borrowRate = borrowRate / Math.pow(10, underlyingDecimals);
    
    console.log(`Now attempting to borrow ${amount} ${tokenName}...`);
    const scaledUpBorrowAmount = (amount * Math.pow(10, underlyingDecimals)).toString();
    const txn = await cTokenContract.methods.borrow(scaledUpBorrowAmount).send({ from: walletAddress });
    console.log("Borrow transaction", txn);

    var balances = await this.borrowBalances(user);
    return {"balances": balances, borrowRate: borrowRate, txn: txn };
}

exports.repayERC20 = async function(user, tokenName, amount) {

    const walletAddress = user.localAddress;
    const userSearch = await UserModel.findOne({email: user.email});
    const privateKey = userSearch.localPrivateKey;
    const provider = new HDWalletProvider(privateKey, infuraURI);
    const web3 = new Web3(provider);
    var cToken = await TokenModel.findOne({ name: "c"+tokenName });
    var token = await TokenModel.findOne({ name: tokenName });
    var cTokenAddress = cToken[CHAIN];
    var tokenAddress = token[CHAIN];
    const underlying = new web3.eth.Contract(erc20Abi, tokenAddress);
    const cTokenContract = new web3.eth.Contract(cErcAbi, cTokenAddress);
    const underlyingDecimals = token.decimal;

    console.log(`Approving ${tokenName} to be transferred from your wallet to the c${tokenName} contract...`);
    const underlyingToRepay = (amount * Math.pow(10, underlyingDecimals)).toString();
    await underlying.methods.approve(cTokenAddress, underlyingToRepay).send({ from: walletAddress });

    const repayBorrow = await cTokenContract.methods.repayBorrow(underlyingToRepay).send({ from: walletAddress });

    if (repayBorrow.events && repayBorrow.events.Failure) {
      const errorCode = repayBorrow.events.Failure.returnValues.error;
      console.error(`repayBorrow error, code ${errorCode}`);
      process.exit(1);
    }

    var balances = await this.borrowBalances(user);
    return { balances: balances, txn: repayBorrow };
}
