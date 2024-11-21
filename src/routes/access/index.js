const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//sign up
router.post("/shop/sign-up", asyncHandler(accessController.signUp));
router.post("/shop/sign-in", asyncHandler(accessController.login));

//authentication
router.use(authentication);
router.post("/shop/logout", asyncHandler(accessController.logout));

router.post(
  "/shop/handleRefreshToken",
  asyncHandler(accessController.handleRefreshToken)
);

module.exports = router;
