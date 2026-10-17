const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    try {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Session expired or invalid token. Please log in again.' });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return next();

    try {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
    } catch (e) {
        // Ignore invalid token for optional endpoints
    }
    next();
};

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;
