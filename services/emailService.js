const nodemailer = require('nodemailer');
const path = require('path');

function getTransporter() {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (!user || !pass) return null;
    return nodemailer.createTransport({
        service: process.env.MAIL_SERVICE || 'gmail',
        auth: { user, pass }
    });
}

// Send email with the OTP and send true or false and handle that in the controller
const sendEmail = async (email, subject, text) => {
    const transporter = getTransporter();
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: email,
            subject: subject,
            text: text
        });
        return true;
    } catch (error) {
        return false;
    }
    return false;
}

module.exports = { sendEmail };
