var express = require("express");
var authRouter = require("./auth");
var dataRouter = require("./data")
var userRouter = require("./user");
var ratesRouter = require("./rates");
var exchangeRouter = require("./exchanges");

var app = express();

app.use("/auth/", authRouter);
app.use("/data/", dataRouter);
app.use("/user/", userRouter);
app.use("/rates/", ratesRouter);
app.use("/exchanges/", exchangeRouter);

module.exports = app;
