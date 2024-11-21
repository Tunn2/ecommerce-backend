const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");

const { getProductById } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class CartService {
  static async createUserCart({ userId, product }) {
    const selectedProduct = await productModel.product.findOne({
      _id: convertToObjectIdMongodb(product.productId),
    });
    console.log(selectedProduct);

    const query = { cart_user_id: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: {
            productId: product.productId,
            shopId: product.shopId,
            quantity: product.quantity,
            name: selectedProduct.product_name,
            price: selectedProduct.product_price,
          },
        },
      },
      options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { quantity, productId } = product;
    const query = {
        cart_user_id: userId,
        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({
      cart_user_id: userId,
    });
    if (!userCart) {
      return await this.createUserCart({ userId, product });
    }
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    //giỏ hàng tồn tại và có sản phẩm này thì update quantity
    return await this.updateUserCartQuantity({ userId, product });
  }

  static async addToCartV2({ userId, shopOrderIds }) {
    const { productId, quantity, oldQuantity } =
      shopOrderIds[0]?.item_products[0];
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Product does not exist");

    if (foundProduct.product_shop.toString() !== shopOrderIds[0]?.shopId)
      throw new NotFoundError("Product does not exist");

    if (quantity === 0) {
      //deleted
    }

    return await this.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - oldQuantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    console.log(userId, productId);
    const query = { cart_user_id: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      },
      options = {
        upsert: true,
        new: true,
      };
    const deleteCart = await cartModel.updateOne(query, updateSet, options);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_user_id: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
