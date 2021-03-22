var express = require("express");
const RatesController = require("../controllers/RatesController");

var router = express.Router();

router.post("/lend", RatesController.lend);
router.post("/redeem", RatesController.redeem);
router.post("/collateral", RatesController.supplyCollateral);
router.delete("/collateral", RatesController.removeCollateral);
router.get("/collateral", RatesController.collateral);
router.post("/borrow", RatesController.borrow);
router.get("/borrow", RatesController.borrowBalances);
router.post("/repay", RatesController.repay);

// AAVE methods. To be merged
//router.post("/aave/lend", RatesController.aaveLend)

//router.get("/balances/:tokenName", BalancesController.balance);

module.exports = router;