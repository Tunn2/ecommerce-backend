require("dotenv").config();
const app = require("./src/app");
const PORT = process.env.PORT || 3055;
const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with 1 ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit server express"));
});
