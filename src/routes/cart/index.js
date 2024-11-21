const express = require("express");
const CartController = require("../../controllers/cart.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
//get a mount of a discount
router.post("/", asyncHandler(CartController.addToCart));
router.delete("/", asyncHandler(CartController.delete));
router.post("/update", asyncHandler(CartController.update));
router.get("/", asyncHandler(CartController.list));

module.exports = router;
