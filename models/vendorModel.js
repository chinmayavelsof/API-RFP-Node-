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
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VendorDetails = sequelize.define('VendorDetails', {  
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    no_of_employees: {
        type: DataTypes.STRING,
        allowNull: false
    },
    revenue: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pancard_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gst_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW()
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW()
    }
}, {
    tableName: 'vendor_details',
    timestamps: false
});

module.exports = VendorDetails;