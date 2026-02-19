const userService = require('../services/userService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]+$/;
const validateAdminRegister = (firstname, lastname, email, password, mobile) => {
    const errors = [];
    if(!firstname || String(firstname).trim() === '') {
        errors.push('First name is required');
    }else if(firstname.length < 3 || firstname.length > 100) {
        errors.push('First name must be between 3 and 100 characters');
    }
    if(!lastname || String(lastname).trim() === '') {
        errors.push('Last name is required');
    }else if(lastname.length < 3 || lastname.length > 100) {
        errors.push('Last name must be between 3 and 100 characters');
    }
    if(!email || String(email).trim() === '') {
        errors.push('Email is required');
    }else if(!EMAIL_REGEX.test(String(email).trim())) {
        errors.push('Email must be a valid format');
    }
    if(!password || String(password).trim() === '') {
        errors.push('Password is required');
    }else if(password.length < 8 || password.length > 20) {
        errors.push('Password must be between 8 and 20 characters');
    }
    if(!mobile || String(mobile).trim() === '') {
        errors.push('Mobile is required');
    }else if(mobile.length !== 10){
        errors.push('Mobile must be a 10 digit number');
    }
    else if(!MOBILE_REGEX.test(String(mobile).trim())) {
        errors.push('Mobile must be a valid number');
    }
    return errors;
}

const registerAdmin = async (req, res) => {
    const { firstname, lastname, email, password, mobile } = req.body;
    const errors = validateAdminRegister(firstname, lastname, email, password, mobile);
    if(errors.length > 0) {
        return res.status(400).json({ response: "error", error: errors });
    }
    // Unique email check
    try {
        let user = await userService.getUserByEmail(email);
        if(user) {
            return res.status(400).json({ response: "error", error: "Email already exists" });
        };
        user = await userService.createUser({ firstname, lastname, email, password, mobile, type: 'admin' });
        return res.status(200).json({ response: "success", message: "Admin registered successfully" });
    } catch (error) {
        return res.status(500).json({ response: "error", error: "Internal server error" });
    }
}

module.exports = {
    registerAdmin
}