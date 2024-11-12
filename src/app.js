const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();

//init middleware

helmet;
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//init db

//init routes
app.get("/", (req, res, next) => {
  const strCompress = "hello Tung";
  return res.status(200).json({
    message: "Welcome Tung",
    metaData: strCompress.repeat(200000),
  });
});
//handling error

module.exports = app;
