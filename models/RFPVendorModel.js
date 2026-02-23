/*
CREATE TABLE `rfp_vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `rfp_id` bigint unsigned NOT NULL,
  `vendor_id` bigint unsigned NOT NULL,
  `applied_status` enum('open','applied') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `item_price` decimal(12,2) DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `applied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfp_vendors_unique` (`rfp_id`,`vendor_id`),
  KEY `rv_vendor_id_fk` (`vendor_id`),
  CONSTRAINT `rv_rfp_id_fk` FOREIGN KEY (`rfp_id`) REFERENCES `rfps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rv_vendor_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) 
*/
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFPVendor = sequelize.define('RFPVendor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rfp_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    applied_status: {
        type: DataTypes.ENUM('open','applied'),
        allowNull: false,
        defaultValue: 'open'
    },
    item_price: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: true
    },
    total_cost: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    applied_at: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'rfp_vendors',
    timestamps: false
});

// RFP and User associations are set in RFPModel.js and userModel.js to avoid circular dependency

module.exports = RFPVendor;