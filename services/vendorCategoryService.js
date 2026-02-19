const VendorCategory = require('../models/vendorCategoryModel');

const createVendorCategories = async (user_id, category_id, options = {}) => {
    return await VendorCategory.create({ user_id, category_id }, options);
};
module.exports = {
    createVendorCategories,
};