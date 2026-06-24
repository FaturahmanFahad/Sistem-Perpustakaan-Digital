const jwt = require('jsonwebtoken');

// Middleware to verify if a valid JWT is provided in headers
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak disediakan atau format salah.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey12345');
        
        req.user = decoded; // Contains id, email, role
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau telah kedaluwarsa.'
        });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Halaman ini hanya untuk Administrator.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin
};
