const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// PUT /api/user/update-name
router.put('/update-name', verifyToken, async (req, res, next) => {
    try {
        const { username, nama } = req.body;
        const newName = username || nama;
        const userId = req.user.id;

        if (!newName || !newName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nama lengkap tidak boleh kosong.'
            });
        }

        const [result] = await db.query(
            'UPDATE users SET username = ? WHERE id = ?',
            [newName.trim(), userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Nama profil berhasil diperbarui.',
            data: {
                id: userId,
                username: newName.trim()
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/user/dashboard-stats
router.get('/dashboard-stats', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. Count active borrowings
        const [[{ active_borrowings }]] = await db.query(
            "SELECT COUNT(*) as active_borrowings FROM borrowings WHERE user_id = ? AND status = 'dipinjam'",
            [userId]
        );

        // 2. Closest due date
        const [[{ closest_due_date }]] = await db.query(
            "SELECT MIN(tanggal_tenggat) as closest_due_date FROM borrowings WHERE user_id = ? AND status = 'dipinjam'",
            [userId]
        );

        // 3. Max loan quota = 3
        const maxQuota = 3;
        const remainingQuota = Math.max(0, maxQuota - active_borrowings);

        return res.status(200).json({
            success: true,
            data: {
                active_borrowings,
                closest_due_date: closest_due_date || null,
                remaining_quota: remainingQuota,
                max_quota: maxQuota
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
