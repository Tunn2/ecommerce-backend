const express = require("express");
const CheckoutController = require("../../controllers/checkout.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
//get a mount of a discount
router.post("/review", asyncHandler(CheckoutController.checkoutReview));

module.exports = router;
