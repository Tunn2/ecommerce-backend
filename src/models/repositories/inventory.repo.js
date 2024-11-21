const { convertToObjectIdMongodb } = require("../../utils");
const inventoryModel = require("../inventory.model");
const { Types } = require("mongoose");

const insertInventory = async ({ productId, location, stock, shopId }) => {
  await inventoryModel.create({
    inven_product_id: new Types.ObjectId(productId),
    inven_location: location,
    inven_stock: stock,
    inven_shop_id: new Types.ObjectId(shopId),
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_product_id: convertToObjectIdMongodb(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: { inven_stock: -quantity },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createOn: new Date(),
        },
      },
    },
    options = { upsert: true, new: true };

  return await inventoryModel.updateOne(query, updateSet, options);
};

module.exports = { insertInventory, reservationInventory };
