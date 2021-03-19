var express = require("express");
const DataController = require("../controllers/DataController");

var router = express.Router();

router.post("/tokens", DataController.tokenStore);

module.exports = router;