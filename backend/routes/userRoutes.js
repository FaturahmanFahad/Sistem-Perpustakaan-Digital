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

module.exports = router;
