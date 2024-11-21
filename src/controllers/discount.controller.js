const DiscountService = require("../services/discount.service");
const { SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new discount successfully",
      statusCode: 201,
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all available discounts successfully",
      statusCode: 200,
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get discount amount successfully",
      statusCode: 200,
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
  getAllProductsWithDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all products with discount code successfully",
      statusCode: 200,
      metadata: await DiscountService.getAllProductsWithDiscountCode({
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
