var MongoClient = require("mongodb").MongoClient;

var MONGODB_URL = "mongodb://127.0.0.1/chainvaultdb";
var dbName = "chainvaultdb";

MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);

  var collections = ["users", "tokens"];
  for (var collection of collections) {
    dbo.collection(collection).deleteMany({});
    console.log("deleted " + collection);
  }

  // fill tokens
  var tokens = [
    { name: "ETH", address: "0x0", decimal: 18},
    { name: "DAI", address: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", decimal: 18},
    { name: "BAT", address: "0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99", decimal: 18},
    { name: "USDC", address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b", decimal: 18},
    { name: "cDAI", address: "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14", decimal: 8},
    { name: "cUSDC", address: "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1", decimal: 8},
    { name: "cBAT", address: "0xEBf1A11532b93a529b5bC942B4bAA98647913002", decimal: 8},
    { name: "cETH", address: "0xd6801a1dffcd0a410336ef88def4320d6df1883e", decimal: 8}
  ];
  insert(dbo, "tokens", tokens);

  // fill users
  var users = [
    { email: "test@gmail.com", password: "$2b$10$ZyWLtNjZ5fKGsH/GjPgFteb3/b5tT0ne92TTAkqaSU4Eji6vK1Pqa", remoteAddress: "0xB9b1225afcFf6AF2c1c958699a2EEbBAF9352964",
      level: true, localAddress: "0xF039c2076bAc51eB12eA188013ee632Fbd354498", localPrivateKey: "447b028046e46eef3f536ce4d4ee0a618eb3e0bcb2e98f9f2e6458a3ab1bc49a"},
  ];
  insert(dbo, "users", users);

  db.close();
});

var insert = function(dbo, collection, objs) {
  dbo.collection(collection).insertMany(objs, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
  });
}
