/*
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive',
  `role` enum('admin','vendor') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
)
*/
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const createUser = async (data, options = {}) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const { firstname, lastname, email, password, mobile, type } = data;
    return await User.create({ firstname, lastname, email, password, mobile, type }, options);
};

const updateUser = async (id, data) => {
    return await User.update(data, { where: { id } });
};

const getUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

module.exports = {
    createUser,
    updateUser,
    getUserByEmail,
};
