/*
 CREATE TABLE `rfp_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `rfp_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfp_categories_unique` (`rfp_id`,`category_id`),
  KEY `rc_category_id_fk` (`category_id`),
  CONSTRAINT `rc_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rc_rfp_id_fk` FOREIGN KEY (`rfp_id`) REFERENCES `rfps` (`id`) ON DELETE CASCADE
)
*/
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFPCategory = sequelize.define('RFPCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rfp_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW()
    }
}, {
    tableName: 'rfp_categories',
    timestamps: false
});

const Category = require('./categoryModel');
RFPCategory.belongsTo(Category, { foreignKey: 'category_id' });
// RFP association is set in RFPModel.js to avoid circular dependency

module.exports = RFPCategory;