const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishedProductByShop,
  unPublishedProductByShop,
  searchProductByUser,
  findAllProducts,
  findProductById,
  updateProductById,
} = require("../models/repositories/product.repo");
const {
  removeUndefinedObject,
  removeUndefinedNullObject,
  updateNestedObjectParser,
} = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");

//define Factory class to create product
class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);
    return new productClass(payload).updateProduct(productId);
  }
  //query

  static async findProductById({ product_id, unSelect = ["__v"] }) {
    return await findProductById({ product_id, unSelect });
  }

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProduct({ searchKey }) {
    return await searchProductByUser({ searchKey });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      filter,
      limit,
      sort,
      page,
      select: [
        "product_name",
        "product_thumb",
        "product_desciption",
        "product_price",
        "product_shop",
      ],
    });
  }

  //put
  static async publishedProductByShop({ product_shop, product_id }) {
    return await publishedProductByShop({ product_shop, product_id });
  }

  static async unPublishedProductByShop({ product_shop, product_id }) {
    return await unPublishedProductByShop({ product_shop, product_id });
  }
}

//define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //create new product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    await insertInventory({
      productId: newProduct._id,
      stock: newProduct.product_quantity,
      shopId: newProduct.product_shop,
    });
    return newProduct;
  }

  async updateProduct(productId, updateBody) {
    return await updateProductById({ productId, updateBody, model: product });
  }
}

//define sub-class for different product type clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing) throw new BadRequestError("Create new clothing error");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }

  async updateProduct(productId) {
    //1. remove attribute has null or undefined
    //2. check xem o cho nao
    const objectParams = removeUndefinedNullObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        updateBody: updateNestedObjectParser(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

//define sub-class for different product type electronics

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Create new electronic error");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError("Create new furniture error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

//register product type

ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
