const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const multer = require('multer');
const upload = multer();

// Accepts multipart/form-data
router.post('/forgetPassword', upload.none(), passwordController.forgetPassword); // Generate OTP and send email
router.post('/confirmotpResetPassword', upload.none(), passwordController.confirmotpResetPassword); // Confirm OTP and reset password
router.post('/resetPassword', upload.none(), passwordController.resetPassword); // Reset password with old password and new password

module.exports = router;