const userService = require('../services/userService');
const emailService = require('../services/emailService');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateForgetPassword = (email) => {
    const errors = [];
    if(!email || String(email).trim() === '') {
        errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    return errors;
}

const validateConfirmotpResetPassword = (email, otp, newPassword) => {
    const errors = [];
    if(!email || String(email).trim() === '') {
        errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    if(!otp || String(otp).trim() === '') {
        errors.push('OTP is required');
    } else if (String(otp).length !== 6) {
        errors.push('OTP must be 6 digits');
    }
    if(!newPassword || String(newPassword).trim() === '') {
        errors.push('New password is required');
    } else if (newPassword.length < 8 || newPassword.length > 20) {
        errors.push('New password must be between 8 and 20 characters');
    }
    return errors;
}

const validateResetPassword = (email, old_password, new_password) => {
    const errors = [];
    if(!email || String(email).trim() === '') {
        errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    if(!old_password || String(old_password).trim() === '') {
        errors.push('Old password is required');
    } else if (old_password.length < 8 || old_password.length > 20) {
        errors.push('Old password must be between 8 and 20 characters');
    }
    if(!new_password || String(new_password).trim() === '') {
        errors.push('New password is required');
    } else if (new_password.length < 8 || new_password.length > 20) {
        errors.push('New password must be between 8 and 20 characters');
    }
    return errors;
}

const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const errors = validateForgetPassword(email);
    if(errors.length > 0) {
        return res.status(400).json({ response: "error", error: errors });
    }
    const user = await userService.getUserByEmail(email);
    if(!user) {
        return res.status(400).json({ response: "error", error: "User not found" });
    }
    // Check if the OTP has already been sent in the last 5 minutes
    if(user.otp && user.otp_expires_at && new Date(user.otp_expires_at) > new Date(Date.now() - 5 * 60 * 1000)) {
        return res.status(400).json({ response: "error", error: "OTP already sent in the last 5 minutes" });
    }
    // Generate OTP and send email and save the otp and otp_expires_at in the database
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await userService.updateUser(user.id, { otp, otp_expires_at });

    // Send email with the otp
    const subject = 'Password Reset OTP';
    const text = `Your password reset OTP is ${otp}. It will expire in 5 minutes.`;
    const result = await emailService.sendEmail(email, subject, text);
    if(!result) {
        logger.error('Forget password: email send failed', { route: 'forgetPassword' });
        return res.status(500).json({ response: "error", error: "Internal server error" });
    }
    logger.info(`OTP sent to ${email}`, { route: 'forgetPassword' });
    return res.status(200).json({ response: "success",  message: "OTP sent to email" });
}

const confirmotpResetPassword = async (req, res) => {
    const { email, otp, new_password } = req.body;
    const errors = validateConfirmotpResetPassword(email, otp, new_password);
    if(errors.length > 0) {
        return res.status(400).json({ response: "error", error: errors });
    }
    const user = await userService.getUserByEmail(email);
    if(!user) {
        return res.status(400).json({ response: "error", error: "User not found" });
    }
    if(user.otp !== otp) {
        return res.status(400).json({ response: "error", error: "Invalid OTP" });
    }
    if(new Date(user.otp_expires_at) < new Date()) {
        return res.status(400).json({ response: "error", error: "OTP has expired" });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userService.updateUser(user.id, { password: hashedPassword });
    logger.info(`Password reset via OTP for ${email}`, { route: 'confirmotpResetPassword' });
    return res.status(200).json({ response: "success", message: "Password reset successfully" });
}

const resetPassword = async (req, res) => {
    const { email, old_password, new_password } = req.body;
    const errors = validateResetPassword(email, old_password, new_password);
    if(errors.length > 0) {
        return res.status(400).json({ response: "error", error: errors });
    }
    const user = await userService.getUserByEmail(email);
    if(!user) {
        return res.status(400).json({ response: "error", error: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(old_password, user.password);
    if(!isPasswordCorrect) {
        return res.status(400).json({ response: "error", error: "Invalid old password" });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userService.updateUser(user.id, { password: hashedPassword });
    logger.info(`Password reset (logged-in) for ${email}`, { route: 'resetPassword' });
    return res.status(200).json({ response: "success", message: "Password reset successfully" });
}

module.exports = {
    forgetPassword,
    confirmotpResetPassword,
    resetPassword,
}
