const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shopOrderIds }) {
    //check cartId có tồn tại không
    const cart = await findCartById(cartId);
    if (!cart) throw new NotFoundError("Cart does not exist");

    const checkoutOrder = {
        totalPrice: 0,
        shipFee: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shopOrderIdNew = [];

    //tính tổng bill
    for (let i = 0; i < shopOrderIds.length; i++) {
      const { shopId, shopDiscounts = [], itemProducts = [] } = shopOrderIds[i];
      //check available product
      const checkProductServer = await checkProductByServer(itemProducts);
      if (!checkProductServer[0]) throw new BadRequestError("Order wrong!!!");

      //tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      //tong tien truoc khi xu li
      checkoutOrder.totalPrice += checkoutPrice;
      const itemCheckout = {
        shopId,
        shopDiscounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        itemProducts: checkProductServer,
      };

      if (shopDiscounts.length > 0) {
        //gia su chi ap dung dc 1 discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          code: shopDiscounts[0].code,
          userId,
          shopId,
          products: checkProductServer,
        });
        console.log(discount);
        checkoutOrder.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
      shopOrderIdNew.push(itemCheckout);
    }
    return {
      shopOrderIds,
      shopOrderIdNew,
      checkoutOrder,
    };
  }

  //order
  static async orderByUser({
    shopOrderIds,
    cartId,
    userId,
    userAddress = {},
    userPayment = {},
  }) {
    const { shopOrderIdNew, checkoutOrder } = await this.checkoutReview({
      cartId,
      userId,
      shopOrderIds,
    });

    //check so luong trong kho
    const products = shopOrderIdNew.flatMap((order) => order.itemProducts);
    console.log(`[1]: `, products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    //check neu co 1 san pham het hang trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "1 so san pham da dc cap nhat, vui long quay lai gio hang"
      );
    }
    const newOrder = await orderModel.create({
      order_user: userId,
      order_checkout: checkoutOrder,
      order_shipping: userAddress,
      order_payment: userPayment,
      order_products: shopOrderIdNew,
    });

    //truong hop: neu insert thanh cong, remove product co trong cart
    if (newOrder) {
    }

    return newOrder;
  }

  //query orders using user id [user]

  static async getOrdersByUser() {}

  //get one order by
  static async getOneOrderByUser() {}

  //cancel order [user]
  static async cancelOrderByUser() {}

  //update order status [shop | admin]
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
