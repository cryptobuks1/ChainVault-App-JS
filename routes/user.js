var express = require("express");
const BalancesController = require("../controllers/BalancesController");

var router = express.Router();

router.get("/balances", BalancesController.balancesList);
router.get("/balances/:tokenName", BalancesController.balance);

module.exports = router;