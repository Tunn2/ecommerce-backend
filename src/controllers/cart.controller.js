const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new cart success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart success",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete cart success",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };
  list = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list cart success",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
