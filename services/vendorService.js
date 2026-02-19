/*
CREATE TABLE `vendor_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `no_of_employees` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revenue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Comma-separated: "year1,year2,year3"',
  `pancard_no` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gst_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_details_user_id_unique` (`user_id`),
  CONSTRAINT `vendor_details_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
)
*/

const VendorDetails = require('../models/vendorModel');
const User = require('../models/userModel');
const VendorCategory = require('../models/vendorCategoryModel');
const userService = require('./userService');
const vendorCategoryService = require('./vendorCategoryService');

const createVendorDetails = async (data, options = {}) => {
    const { user_id, no_of_employees, revenue, pancard_no, gst_no } = data;
    return await VendorDetails.create({ user_id, no_of_employees, revenue, pancard_no, gst_no }, options);
};

const getVendorDetailsByUserId = async (userId) => {
    return await VendorDetails.findOne({ where: { user_id: userId } });
};

const getVendorDetailsByPancardNo = async (pancard_no) => {
    return await VendorDetails.findOne({ where: { pancard_no } });
};

const getVendorDetailsByGstNo = async (gst_no) => {
    return await VendorDetails.findOne({ where: { gst_no } });
};

// Fetch vendor_details with user info and categories; return flat shape: user_id, name, email, mobile, no_of_employees, status, categories
const getVendorList = async () => {
    const rows = await VendorDetails.findAll({
        include: [{
            model: User,
            attributes: ['id', 'firstname', 'lastname', 'email', 'mobile', 'status'],
            required: true,
            include: [{
                model: VendorCategory,
                attributes: ['category_id'],
                required: false
            }]
        }]
    });
    return rows.map((row) => mapRowToVendor(row.get({ plain: true })));
};

const mapRowToVendor = (plain) => {
    const user = plain.User || {};
    const vendorCats = user.VendorCategories || [];
    const categories = vendorCats.map((c) => c.category_id).join(',');
    return {
        user_id: plain.user_id,
        name: [user.firstname, user.lastname].filter(Boolean).join(' '),
        email: user.email,
        mobile: user.mobile,
        no_of_employees: plain.no_of_employees,
        status: user.status,
        categories: categories || ''
    };
};

// Same as getVendorList but only vendors that have this category_id
const getVendorListByCategory = async (categoryId) => {
    const rows = await VendorDetails.findAll({
        include: [{
            model: User,
            attributes: ['id', 'firstname', 'lastname', 'email', 'mobile', 'status'],
            required: true,
            include: [{
                model: VendorCategory,
                attributes: ['category_id'],
                required: true,
                where: { category_id: categoryId }
            }]
        }]
    });
    return rows.map((row) => mapRowToVendor(row.get({ plain: true })));
};

// status: 1 = approve (Approved), 2 = reject (Rejected). vendor_id is user id.
const approveOrRejectVendor = async (vendorId, status) => {
    const newStatus = status === 1 ? 'Approved' : status === 2 ? 'Rejected' : null;
    if (!newStatus) return false;
    const [count] = await userService.updateUser(vendorId, { status: newStatus });
    return count > 0;
};

module.exports = {
    createVendorDetails,
    getVendorDetailsByUserId,
    getVendorDetailsByPancardNo,
    getVendorDetailsByGstNo,
    getVendorList,
    getVendorListByCategory,
    approveOrRejectVendor,
};