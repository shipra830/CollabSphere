const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Token format usually is "Bearer <token>", so we split it or use directly if sent directly
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
      req.user = decoded.userId; // Ab req.user ek object ban gaya hai// Save userId to request object
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};