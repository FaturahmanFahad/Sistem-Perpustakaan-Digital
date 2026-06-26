const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /api/members
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT id, username AS nama, email, created_at FROM users WHERE role = 'user'");
        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
