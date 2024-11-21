const express = require("express");
const DiscountController = require("../../controllers/discount.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
//get a mount of a discount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list-products-with-code",
  asyncHandler(discountController.getAllProductsWithDiscountCode)
);

//authentication
router.use(authentication);

router.post("/", asyncHandler(discountController.createDiscount));
router.get("/", asyncHandler(discountController.getAllDiscount));

module.exports = router;
