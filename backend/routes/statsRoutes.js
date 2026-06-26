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

// GET /api/stats/borrowed-details (Get active borrowings details with JOIN)
router.get('/borrowed-details', verifyToken, async (req, res, next) => {
    try {
        const queryStr = `
            SELECT u.username AS nama_user, bk.judul AS judul_buku, b.tanggal_pinjam, b.tanggal_kembali
            FROM borrowings b
            JOIN users u ON b.user_id = u.id
            JOIN books bk ON b.book_id = bk.id
            WHERE b.status = 'dipinjam'
        `;
        const [rows] = await db.query(queryStr);
        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
