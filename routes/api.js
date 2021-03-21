var express = require("express");
var authRouter = require("./auth");
var dataRouter = require("./data")
var userRouter = require("./user");
var ratesRouter = require("./rates");

var app = express();

app.use("/auth/", authRouter);
app.use("/data/", dataRouter);
app.use("/user/", userRouter);
app.use("/rates/", ratesRouter);

module.exports = app;