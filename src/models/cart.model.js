const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

var cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    },
    cart_count_product: { type: Number, default: 0 },
    cart_user_id: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: "createOn",
      updatedAt: "modifiedOn",
    },
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, cartSchema);
