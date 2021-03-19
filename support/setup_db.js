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
    { name: "DAI", address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea"},
    { name: "BAT", address: "0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99"},
    { name: "USDC", address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b"},
  ];
  insert(dbo, "tokens", tokens);

  // fill users
  var users = [
    { email: "test@gmail.com", password: "$2b$10$ZyWLtNjZ5fKGsH/GjPgFteb3/b5tT0ne92TTAkqaSU4Eji6vK1Pqa", remoteAddress: "0xB9b1225afcFf6AF2c1c958699a2EEbBAF9352964",
      level: true, localAddress: "0xD93ec03787218Ea08EA3AAf36064A0f7F62543A4", localPrivateKey: "98c642e73ab4e301a8234a90a3d47ebdd19a54897c2b037c74bee853e5f09771"},
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