const logger = require('../utils/logger');

const SENSITIVE = ['password', 'old_password', 'new_password', 'newPassword', 'token'];

const redact = (obj) => {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(redact);
    const out = { ...obj };
    for (const key of Object.keys(out)) {
        if (SENSITIVE.some((s) => key.toLowerCase() === s.toLowerCase())) out[key] = '[REDACTED]';
        else if (typeof out[key] === 'object' && out[key] !== null) out[key] = redact(out[key]);
    }
    return out;
};

module.exports = (req, res, next) => {
    const send = res.json.bind(res);
    res.json = (body) => {
        logger.info('Request / Response', {
            route: `${req.method} ${req.originalUrl || req.url}`,
            requestBody: req.body && Object.keys(req.body).length ? redact(req.body) : undefined,
            responseBody: body != null && (typeof body !== 'object' || Object.keys(body).length > 0) ? redact(body) : undefined,
        });
    return send(body);
    };
    next();
};
