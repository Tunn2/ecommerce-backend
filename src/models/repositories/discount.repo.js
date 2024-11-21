const { getSelectData, unGetSelectData } = require("../../utils/index");

const findAllDiscountsCodeUnSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(unGetSelectData(unSelect))
    .lean();
  return discounts;
};

const findAllDiscountsCodeSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(getSelectData(select))
    .lean();
  return discounts;
};

const checkDiscountExists = async (model, filter) => {
  return await model.findOne(filter).lean();
};

module.exports = {
  findAllDiscountsCodeUnSelect,
  findAllDiscountsCodeSelect,
  checkDiscountExists,
};
