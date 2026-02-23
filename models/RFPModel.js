/*
CREATE TABLE `rfps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` bigint unsigned NOT NULL,
  `rfp_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_description` text COLLATE utf8mb4_unicode_ci,
  `quantity` int unsigned NOT NULL,
  `last_date` date NOT NULL,
  `minimum_price` decimal(12,2) NOT NULL,
  `maximum_price` decimal(12,2) NOT NULL,
  `status` enum('open','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfps_rfp_no_unique` (`rfp_no`),
  KEY `rfps_admin_id_fk` (`admin_id`),
  CONSTRAINT `rfps_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
)
*/
const RFPCategory = require('./RFPCategoryModel');
const RFPVendor = require('./RFPVendorModel');
const User = require('./userModel');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFP = sequelize.define('RFP', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rfp_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    minimum_price: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false
    },
    maximum_price: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open','closed'),
        allowNull: false,
        defaultValue: 'open'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'rfps',
    timestamps: false
});

RFP.belongsTo(User, { foreignKey: 'admin_id' });
RFP.hasMany(RFPCategory, { foreignKey: 'rfp_id' });
RFPCategory.belongsTo(RFP, { foreignKey: 'rfp_id' });
RFP.hasMany(RFPVendor, { foreignKey: 'rfp_id' });
RFPVendor.belongsTo(RFP, { foreignKey: 'rfp_id' });

module.exports = RFP;