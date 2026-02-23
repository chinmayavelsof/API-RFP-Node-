const VendorCategory = require('../models/vendorCategoryModel');
const logger = require('../utils/logger');

const createVendorCategories = async (user_id, category_id, options = {}) => {
    try {
        return await VendorCategory.create({ user_id, category_id }, options);
    } catch (err) {
        logger.error(`Failed to create vendor categories: ${err.message}`, { route: 'createVendorCategories' });
        throw new Error('Failed to create vendor categories');
    }
};

module.exports = {
    createVendorCategories,
};