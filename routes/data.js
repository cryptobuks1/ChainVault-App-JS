var express = require("express");
const DataController = require("../controllers/DataController");

var router = express.Router();

router.post("/tokens", DataController.tokenStore);
router.get("/tokens", DataController.tokenList);
router.get("/tokens/:tokenID", DataController.token);

module.exports = router;