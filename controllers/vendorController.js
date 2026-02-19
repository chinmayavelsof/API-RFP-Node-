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

const vendorService = require('../services/vendorService');
const userService = require('../services/userService');
const vendorCategoryService = require('../services/vendorCategoryService');
const categoryService = require('../services/categoryService');
const logger = require('../utils/logger');
const sequelize = require('../config/db');

const PANCARD_NO_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_NO_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//Last 3 years revenue (comma-separated)
const REVENUE_REGEX = /^[0-9]+,[0-9]+,[0-9]+$/;
const NO_OF_EMPLOYEES_REGEX = /^[0-9]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]+$/;
const validateVendorRegister = (no_of_employees, revenue, pancard_no, gst_no) => {
    const errors = [];
    if(!no_of_employees || String(no_of_employees).trim() === '') {
        errors.push('No of employees is required');
    }else if(no_of_employees.length < 1 || no_of_employees.length > 50) {
        errors.push('No of employees must be between 1 and 50 characters');
    }else if(!NO_OF_EMPLOYEES_REGEX.test(String(no_of_employees).trim())) {
        errors.push('No of employees must be a valid number');
    }
    if(!revenue || String(revenue).trim() === '') {
        errors.push('Revenue is required');
    }else if(revenue.length > 255) {
        errors.push('Revenue must be less than 255 characters');
    }else if(!REVENUE_REGEX.test(String(revenue).trim())) {
        errors.push('Revenue must be a valid format');
    }
    if(!pancard_no || String(pancard_no).trim() === '') {
        errors.push('Pancard number is required');
    }else if(!PANCARD_NO_REGEX.test(String(pancard_no).trim())) {
        errors.push('Pancard number must be a valid format');
    }
    if(!gst_no || String(gst_no).trim() === '') {
        errors.push('GST number is required');
    }else if(!GST_NO_REGEX.test(String(gst_no).trim())) {
        errors.push('GST number must be a valid format');
    }
    return errors;
}
const validateUserRegister = (firstname, lastname, email, password, mobile) => {
    const errors = [];
    if(!firstname || String(firstname).trim() === '') {
        errors.push('First name is required');
    }else if(firstname.length < 3 || firstname.length > 100) {
        errors.push('First name must be between 3 and 100 characters');
    }
    if(!lastname || String(lastname).trim() === '') {
        errors.push('Last name is required');
    }else if(lastname.length < 3 || lastname.length > 100) {
        errors.push('Last name must be between 3 and 100 characters');
    }
    if(!email || String(email).trim() === '') {
        errors.push('Email is required');
    }else if(!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    if(!password || String(password).trim() === '') {
        errors.push('Password is required');
    }else if(password.length < 8 || password.length > 20) {
        errors.push('Password must be between 8 and 20 characters');
    }
    if(!mobile || String(mobile).trim() === '') {
        errors.push('Mobile is required');
    }else if(mobile.length !== 10){
        errors.push('Mobile must be a 10 digit number');
    }
    else if(!MOBILE_REGEX.test(String(mobile).trim())) {
        errors.push('Mobile must be a valid number');
    }
    return errors;
}
// For resgitering vendor first register as user then register as vendor and use DB transactions to ensure data consistency
const registerVendor = async (req, res) => {
    const {firstname, lastname, email, password, mobile, no_of_employees, revenue, pancard_no, gst_no, category } = req.body;
    const userErrors = validateUserRegister(firstname, lastname, email, password, mobile);
    const vendorErrors = validateVendorRegister(no_of_employees, revenue, pancard_no, gst_no);
    const errors = [...userErrors, ...vendorErrors];
    if(errors.length > 0) {
        return res.status(200).json({ response: "error", error: errors });
    }
    // Unique email check
    let user = await userService.getUserByEmail(email);
    if(user) {
        return res.status(200).json({ response: "error", error: "Email already exists" });
    }
    // Unique pancard number check
    let vendor = await vendorService.getVendorDetailsByPancardNo(pancard_no);
    if(vendor) {
        return res.status(200).json({ response: "error", error: "Pancard number already exists" });
    }
    // Unique GST number check
    vendor = await vendorService.getVendorDetailsByGstNo(gst_no);
    if(vendor) {
        return res.status(200).json({ response: "error", error: "GST number already exists" });
    }
    // category have comma separated values
    const categories = category.split(',');
    for(const category of categories) {
        const categoryId = await categoryService.getCategoryById(category);
        if(!categoryId) {
            return res.status(200).json({ response: "error", error: "Category not found" });
        }
    }
    // Create user then vendor details using DB transaction so both succeed or both rollback
    const transaction = await sequelize.transaction();
    try {
        user = await userService.createUser({ firstname, lastname, email, password, mobile, type: 'vendor' }, { transaction });
        await vendorService.createVendorDetails({ user_id: user.id, no_of_employees, revenue, pancard_no, gst_no }, { transaction });
        for(const category of categories) {
            await vendorCategoryService.createVendorCategories(user.id, category, { transaction });
        }
        await transaction.commit();
        logger.info('Vendor registered successfully', { route: 'registerVendor' });
        return res.status(200).json({ response: "success", message: "Vendor registered successfully" });
    } catch (err) {
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            logger.error(`Transaction rollback failed: ${rollbackErr.message}`, { route: 'registerVendor' });
        }
        logger.error(`Vendor registration failed: ${err.message}`, { route: 'registerVendor' });
        return res.status(200).json({ response: "error", error: "Internal server error" });
    }
}

const getVendorList = async (req, res) => {
    const vendors = await vendorService.getVendorList();
    return res.status(200).json({ response: "success", vendors: vendors });
}
module.exports = {
    registerVendor,
    getVendorList,
}