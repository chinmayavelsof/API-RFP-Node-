const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// All POST requests use multipart/form-data (not JSON) — parsed by multer in routes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLogin = (email, password) => {
    const errors = [];
    if (!email || String(email).trim() === '') {
        errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    if(!password || String(password).trim() === '') {
        errors.push('Password is required');
    }else if(password.length < 8 || password.length > 20) {
        errors.push('Password must be between 8 and 20 characters');
    }
    return errors
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const errors = validateLogin(email, password);
    if(errors.length > 0) {
        return res.status(400).json({ response: "error", error: errors });
    }
    try {
        const user = await userService.getUserByEmail(email);
        if(!user) {
            return res.status(400).json({ response: "error", error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({ response: "error", error: "Invalid email or password" });
        }
        if(user.status != 'Approved') {
            return res.status(400).json({ response: "error", error: "User is not approved" });
        }
        const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        logger.info(`User logged in: ${user.email}`, { route: 'login' });
        return res.status(200).json({ response: "success", data: { id: user.id, type: user.type, name: user.firstname + ' ' + user.lastname, email: user.email, token } });
    } catch (err) {
        logger.error(`Login failed: ${err.message}`, { route: 'login' });
        return res.status(500).json({ response: "error", error: "Internal server error" });
    }
}

module.exports = {
    login
}