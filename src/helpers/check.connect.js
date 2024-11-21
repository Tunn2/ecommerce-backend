const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

//count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("Number of connections:", numConnection);
};

//check overload
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    //example maximum number of connect based on number of cores
    const maxConnection = numCore * 5;
    console.log(`Active connection: ${numConnection}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnection) {
      console.log("Connection overload detected");
    }
  }, _SECONDS);
};

module.exports = { countConnect, checkOverload };
