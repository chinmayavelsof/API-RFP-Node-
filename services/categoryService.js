/*
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) 
*/
const Category = require('../models/categoryModel');
const logger = require('../utils/logger');

const createCategory = async (name) => {
    try {
        return await Category.create({ name });
    } catch (err) {
        logger.error(`Failed to create category: ${err.message}`, { route: 'createCategory' });
        throw new Error('Failed to create category');
    }
};

const getCategoryById = async (id) => {
    try {
        return await Category.findOne({ where: { id } });
    } catch (err) {
        logger.error(`Failed to get category by id: ${err.message}`, { route: 'getCategoryById' });
        throw new Error('Failed to get category by id');
    }
};

const getCategoryByName = async (name) => {
    try {
        return await Category.findOne({ where: { name } });
    } catch (err) {
        logger.error(`Failed to get category by name: ${err.message}`, { route: 'getCategoryByName' });
        throw new Error('Failed to get category by name');
    }
};

const getCategoryList = async () => {
    try {
        return await Category.findAll();
    } catch (err) {
        logger.error(`Failed to get category list: ${err.message}`, { route: 'getCategoryList' });
        throw new Error('Failed to get category list');
    }
};

const deleteCategory = async (id) => {
    try {
        return await Category.destroy({ where: { id } });
    } catch (err) {
        logger.error(`Failed to delete category: ${err.message}`, { route: 'deleteCategory' });
        throw new Error('Failed to delete category');
    }
};

const updateCategory = async (id, name) => {
    try {
        return await Category.update({ name }, { where: { id } });
    } catch (err) {
        logger.error(`Failed to update category: ${err.message}`, { route: 'updateCategory' });
        throw new Error('Failed to update category');
    }
};

const updateCategoryStatus = async (id, status) => {
    try {
        return await Category.update({ status }, { where: { id } });
    } catch (err) {
        logger.error(`Failed to update category status: ${err.message}`, { route: 'updateCategoryStatus' });
        throw new Error('Failed to update category status');
    }
};

module.exports = {
    getCategoryById,
    getCategoryList,
    createCategory,
    getCategoryByName,
    deleteCategory,
    updateCategory,
    updateCategoryStatus
};