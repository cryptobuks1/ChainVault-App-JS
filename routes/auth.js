var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.delete("/login", AuthController.logout)

module.exports = router;