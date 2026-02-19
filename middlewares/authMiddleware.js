const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ response: "error", message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ response: "error", message: 'Unauthorized' });
    }
};

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ response: "error", message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        if (decoded.type !== 'admin') {
            return res.status(403).json({ response: "error", message: 'Forbidden' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ response: "error", message: 'Unauthorized' });
    }
};

module.exports = { authMiddleware, isAdmin };