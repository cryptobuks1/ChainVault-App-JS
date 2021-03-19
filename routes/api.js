var express = require("express");
var authRouter = require("./auth");
var dataRouter = require("./data")

var app = express();

app.use("/auth/", authRouter);
app.use("/data/", dataRouter);

module.exports = app;