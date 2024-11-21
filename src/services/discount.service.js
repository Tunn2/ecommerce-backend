const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountsCodeSelect,
  findAllDiscountsCodeUnSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class DiscountService {
  static async createDiscount(payload) {
    const {
      code,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productIds,
      appliesTo,
      name,
      description,
      type,
      value,
      maxValue,
      usesCount,
      maxUsePerUser,
      maxUse,
      userUsed,
    } = payload;

    if (
      new Date() > new Date(startDate) ||
      new Date(startDate) >= new Date(endDate)
    ) {
      throw new BadRequestError("Invalid date time");
    }
    //create index for discount
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
      })
      .lean();
    if (foundDiscount)
      throw new BadRequestError("This discount code is existed");

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: minOrderValue || 0,
      discount_max_value: maxValue,
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_max_uses: maxUse,
      discount_uses_count: usesCount,
      discount_users_used: userUsed,
      discount_max_use_per_user: maxUsePerUser,
      discount_is_active: isActive,
      discount_applies_to: appliesTo,
      discount_product_ids: appliesTo === "all" ? [] : productIds,
      discount_shop_id: shopId,
    });

    return newDiscount;
  }

  static async updateDiscount() {}

  /**
   * get all products are applied to a discount by discount code
   */

  static async getAllProductsWithDiscountCode({
    code,
    limit,
    page,
    shopId,
    userId,
  }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_is_active: true,
        discount_shop_id: shopId,
      })
      .lean();

    if (!foundDiscount) throw new NotFoundError("Discount does not exist");
    let products;
    if (foundDiscount.discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: foundDiscount.discount_shop_id,
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (foundDiscount.discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: foundDiscount.discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountsCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shop_id: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shop_id"],
      model: discountModel,
    });

    return discounts;
  }

  static async getDiscountAmount({ code, userId, shopId, products }) {
    const discount = await checkDiscountExists(discountModel, {
      discount_code: code,
      discount_shop_id: convertToObjectIdMongodb(shopId),
    });

    if (!discount) throw new NotFoundError("Discount does not exists");

    if (!discount.discount_is_active)
      throw new NotFoundError("Discount expired");
    if (discount.discount_max_uses === 0)
      throw new NotFoundError("Discount is out");
    if (
      new Date() > new Date(discount.discount_end_date) ||
      new Date() < new Date(discount.discount_start_date)
    )
      throw new NotFoundError("Discount has expired");

    //check gia tri toi thieu
    let totalOrder = 0;
    if (discount.discount_min_order_value > 0) {
      //get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount.discount_min_order_value)
        throw new NotFoundError(
          `Discount requires a minimum order value of ${discount.discount_min_order_value}`
        );
    }
    if (discount.discount_max_use_per_user > 0) {
      const userUseDiscount = discount.discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUseDiscount) {
        //....
      }
    }
    let reducedAmount = 0;
    console.log("Total order: ", totalOrder);
    console.log("discoun: ", discount.discount_value);

    if (discount.discount_type === "fixed_amount") {
      reducedAmount = totalOrder - discount.discount_value;
    } else if (discount.discount_type === "percentage") {
      reducedAmount = totalOrder * (discount.discount_value / 100);
      if (
        reducedAmount > discount.discount_max_value &&
        discount.discount_max_value > 0
      )
        reducedAmount = discount.discount_max_value;
    } else {
      throw new BadRequestError("Type of discount is invalid");
    }

    return {
      totalOrder,
      discount: reducedAmount,
      totalPrice: totalOrder - reducedAmount,
    };
  }

  static async deleteDiscount({ shopId, code }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shop_id: convertToObjectIdMongodb(shopId),
    });
    return deleted;
  }

  static async cancelDiscount({ code, shopId, userId }) {
    const discount = await checkDiscountExists(discountModel, {
      discount_code: code,
      discount_shop_id: convertToObjectIdMongodb(shopId),
    });

    if (!discount) throw new NotFoundError("Discount does not exists");

    const result = await discountModel.findByIdAndUpdate(discount._id, {
      $pull: {
        discount_users_used: convertToObjectIdMongodb(userId),
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
