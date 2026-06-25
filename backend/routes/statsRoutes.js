const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// Endpoint to get total books (protected or public; let's make it verifyToken protected if the dashboard is protected)
router.get('/total-books', verifyToken, async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS total FROM books');
        const total = rows[0].total;
        return res.status(200).json({
            success: true,
            data: {
                total: total
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
