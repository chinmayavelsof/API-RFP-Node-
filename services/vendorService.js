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

const getVendorList = async () => {
    return await VendorDetails.findAll();
};

module.exports = {
    createVendorDetails,
    getVendorDetailsByUserId,
    getVendorDetailsByPancardNo,
    getVendorDetailsByGstNo,
    getVendorList,
};