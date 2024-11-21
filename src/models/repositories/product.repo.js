const { BadRequestError, NotFoundError } = require("../../core/error.response");
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} = require("../../utils");
const {
  product,
  electronic,
  furniture,
  clothing,
} = require("../product.model");
const { Types } = require("mongoose");

const getProductById = async (productId) => {
  return await product
    .findOne({ _id: convertToObjectIdMongodb(productId), isPublished: true })
    .lean();
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(getSelectData(select))
    .lean();
  return products;
};

const searchProductByUser = async ({ searchKey }) => {
  const regexSearch = new RegExp(searchKey);
  const result = await product
    .find(
      {
        isPublished: true,
        $text: {
          $search: regexSearch,
        },
      },
      {
        score: {
          $meta: "textScore",
        },
      }
    )
    .sort({
      score: {
        $meta: "textScore",
      },
    })
    .lean();
  return result;
};

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const publishedProductByShop = async ({ product_shop, product_id }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundProduct) return null;
  foundProduct.isDraft = false;
  foundProduct.isPublished = true;
  const result = await foundProduct.updateOne(foundProduct);
  return result;
};

const unPublishedProductByShop = async ({ product_shop, product_id }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundProduct) return null;
  foundProduct.isDraft = true;
  foundProduct.isPublished = false;
  const result = await foundProduct.updateOne(foundProduct);
  return result;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const findProductById = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

const updateProductById = async ({
  productId,
  updateBody,
  model,
  isNew = true,
}) => {
  console.log(updateBody);
  return await model.findByIdAndUpdate(productId, updateBody, { new: isNew });
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId);
      if (foundProduct)
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
    })
  );
};

module.exports = {
  findAllPublishForShop,
  findAllDraftsForShop,
  publishedProductByShop,
  unPublishedProductByShop,
  searchProductByUser,
  findAllProducts,
  findProductById,
  updateProductById,
  getProductById,
  checkProductByServer,
};
