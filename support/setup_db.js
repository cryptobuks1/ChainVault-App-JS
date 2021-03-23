// mongodb libraries
var MONGODB_URL = "mongodb://127.0.0.1/chainvaultdb";
var dbName = "chainvaultdb";
var mongoose = require("mongoose");

// import models
const { TokenModel } = require('../models/TokenModel');
const { ContractModel } = require('../models/ContractModel');
const { UserModel } = require('../models/UserModel');
const { TradeModel } = require('../models/TransactionModel');
const lpTool = require('./setup_db_lptokens');

const MODELS = [TokenModel, ContractModel, UserModel, TradeModel];

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
})
.catch(err => {
    console.error("App starting error:", err.message);
    process.exit(1);
});

var backfillDB = async function() {

    // delete tables
    for (var model of MODELS) {
        console.log("deleted " + model.modelName);
        await model.deleteMany();
    }

    // fill tokens
    console.log("fill tokens");
    var tokensData = [
        { name: "ETH", description: "ETH",
        MAINNET: "0x0", KOVAN: "0x0", RINKEBY: "0x0", decimal: 18},
        { name: "WETH", description: "WETH",
        MAINNET: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", KOVAN: "0xd0A1E359811322d97991E03f863a0C30C2cF029C", RINKEBY: "0xFB29A3f194b254cB472341F80C63Be99469b0DF6", decimal: 18},
        { name: "DAI", description: "DAI",
        MAINNET: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", KOVAN: "0x1528F3FCc26d13F7079325Fb78D9442607781c8C", RINKEBY: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",  decimal: 18},
        { name: "MKR", description: "MKR",
        MAINNET: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", KOVAN: "0xef13C0c8abcaf5767160018d268f9697aE4f5375", RINKEBY: "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",  decimal: 18},
        { name: "UNI", description: "UNI",
        MAINNET: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", KOVAN: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", RINKEBY: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",  decimal: 18},
        { name: "BAT", description: "BAT",
        MAINNET: "0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99", KOVAN: "0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE", RINKEBY: "0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99", decimal: 18},
        { name: "USDC", description: "USDC",
        MAINNET: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b", KOVAN: "0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5", RINKEBY: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",  decimal: 6},
        { name: "cDAI", description: "cDAI",
        MAINNET: "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14", KOVAN: "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad", RINKEBY: "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14",  decimal: 8},
        { name: "cUSDC", description: "cUSDC",
        MAINNET: "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1", KOVAN: "0x4a92e71227d294f041bd82dd8f78591b75140d63", RINKEBY: "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1",  decimal: 8},
        { name: "cBAT", description: "cBAT",
        MAINNET: "0xEBf1A11532b93a529b5bC942B4bAA98647913002", KOVAN: "0x4a77faee9650b09849ff459ea1476eab01606c7a", RINKEBY: "0xEBf1A11532b93a529b5bC942B4bAA98647913002",  decimal: 8},
        { name: "cETH", description: "cETH",
        MAINNET: "0xd6801a1dffcd0a410336ef88def4320d6df1883e", KOVAN: "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72", RINKEBY: "0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e",  decimal: 8}
    ];
    await insert(TokenModel, tokensData);

    // fill contracts
    console.log("fill contracts");
    var contractsData = [
        { name: "COMP_COMPTROLLER", description: "Compound comptroller",
        MAINNET: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", KOVAN: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", RINKEBY: "0x2EAa9D77AE4D8f9cdD9FAAcd44016E746485bddb"},
        { name: "UNI_ROUTER", description: "Uniswap router",
        MAINNET: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", KOVAN: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", RINKEBY: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"},
        { name: "SUSHI_ROUTER", description: "Sushiswap router",
        MAINNET: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", KOVAN: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", RINKEBY: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"},
    ];
    await insert(ContractModel, contractsData);

    // fill users
    console.log("fill users");
    var usersData = [
        { email: "tes1@gmail.com", password: "$2b$10$ZyWLtNjZ5fKGsH/GjPgFteb3/b5tT0ne92TTAkqaSU4Eji6vK1Pqa", remoteAddress: "0xB9b1225afcFf6AF2c1c958699a2EEbBAF9352964",
            level: true, localAddress: "0xF039c2076bAc51eB12eA188013ee632Fbd354498", localPrivateKey: "447b028046e46eef3f536ce4d4ee0a618eb3e0bcb2e98f9f2e6458a3ab1bc49a"},
        { email: "test@gmail.com", password: "$2b$10$ZyWLtNjZ5fKGsH/GjPgFteb3/b5tT0ne92TTAkqaSU4Eji6vK1Pqa", remoteAddress: "0xB9b1225afcFf6AF2c1c958699a2EEbBAF9352964",
            level: true, localAddress: "0xD93ec03787218Ea08EA3AAf36064A0f7F62543A4", localPrivateKey: "98c642e73ab4e301a8234a90a3d47ebdd19a54897c2b037c74bee853e5f09771"},
    ];
    await insert(UserModel, usersData);

    // fill trades
    console.log("fill trades");
    var tradesData = [
        {transactionID: "0x7d75ee86b47209ab567724ef7697192177af3d7dd7865f600f32604348abce7b", exchange: "Uniswap", tokenA: "ETH",
        tokenB: "DAI", sizeA: 1., sizeB: 1891.1, priceA: 1891.1, priceB: 1., gasPrice: 0.0001}
    ];
    await insert(TradeModel, tradesData);

    // push trade onto user
    const users = await UserModel.find();
    const trades1 = await TradeModel.find();
    for (var user of users) {
        for (var trade of trades1) {
            user.trades.push(trade);
        }
        await user.save();
    }
};

backfillDB();
//lpTool.populateLPs();

var insert = async function(model, objs) {
    for (var obj of objs) {
        let entry = new model(obj);
        await entry.save();
    }
}
