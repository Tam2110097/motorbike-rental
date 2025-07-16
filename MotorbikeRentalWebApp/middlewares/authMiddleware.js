const JWT = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Không có token xác thực' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role || 'customer'
        };

        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
};

module.exports = authMiddleware;
