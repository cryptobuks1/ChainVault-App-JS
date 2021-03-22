var express = require("express");
const ExchangeController = require("../controllers/ExchangeController");
var router = express.Router();

router.get("/price/:exchangeName/:tokenToPrice/:tokenToPriceIn", ExchangeController.price);
router.get("/LPaddress/:exchangeName/:tokenA/:tokenB", ExchangeController.LPaddress);
router.post("/swapForExact", ExchangeController.swapForExact);
router.post("/addLP", ExchangeController.addLP);
router.post("/removeLP", ExchangeController.removeLP);
module.exports = router;
