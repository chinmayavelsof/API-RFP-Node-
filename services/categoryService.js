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

const createCategory = async (name) => {
    return await Category.create({ name });
};

const getCategoryById = async (id) => {
    return await Category.findOne({ where: { id } });
};

const getCategoryByName = async (name) => {
    return await Category.findOne({ where: { name } });
};

const getCategoryList = async () => {
    return await Category.findAll();
};

const deleteCategory = async (id) => {
    return await Category.destroy({ where: { id } });
};

const updateCategory = async (id, name) => {
    return await Category.update({ name }, { where: { id } });
};

const updateCategoryStatus = async (id, status) => {
    return await Category.update({ status }, { where: { id } });
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