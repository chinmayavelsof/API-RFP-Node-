/*
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('admin','vendor') NOT NULL,
  `status` enum('Approved', 'Pending', 'Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `otp` varchar(6) NULL,
  `otp_expires_at` datetime NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
);
-- If table already exists without OTP columns, run: ALTER TABLE `users` ADD COLUMN `otp` VARCHAR(6) NULL, ADD COLUMN `otp_expires_at` DATETIME NULL;
*/
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('admin', 'vendor'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Approved', 'Pending', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: true
    },
    otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'users',
    timestamps: false
});

const VendorCategory = require('./vendorCategoryModel');
User.hasMany(VendorCategory, { foreignKey: 'user_id' });
VendorCategory.belongsTo(User, { foreignKey: 'user_id' });

module.exports = User;