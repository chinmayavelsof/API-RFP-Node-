const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            type: decoded.type
        };
        next();
    } catch (error) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
};

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'admin') {
            return res.status(200).json({ response: "error", error: ["Forbidden"] });
        }
        req.user = { id: decoded.id, email: decoded.email, type: decoded.type };
        next();
    } catch (error) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
};

const isVendor = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'vendor') {
            return res.status(200).json({ response: "error", error: ["Forbidden - Vendor only"] });
        }
        req.user = { id: decoded.id, email: decoded.email, type: decoded.type };
        next();
    } catch (error) {
        return res.status(200).json({ response: "error", error: ["Unauthorized"] });
    }
};

module.exports = { authMiddleware, isAdmin, isVendor };