const express = require("express");
const InventoryController = require("../../controllers/inventory.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
//get a mount of a discount
router.use(authentication);
router.post("/", asyncHandler(InventoryController.addStockToInventory));

module.exports = router;
