const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

var inventorySchema = new Schema(
  {
    inven_product_id: { type: Schema.Types.ObjectId, ref: "Product" },
    inven_location: { type: String, default: "Unknown" },
    inven_stock: { type: String, required: true },
    inven_shop_id: { type: Schema.Types.ObjectId, ref: "Shop" },
    inven_reservations: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, inventorySchema);
