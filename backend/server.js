const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Express
const app = express();

// Configure Middleware
app.use(cors()); // Allow cross-origin requests (for our React frontend)
app.use(express.json()); // Parse JSON body payloads

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/members', memberRoutes);

// Endpoint Notifikasi Sederhana
const { verifyToken } = require('./middlewares/authMiddleware');
app.get('/api/notifications', verifyToken, (req, res) => {
    const notifications = [
        { id: 1, text: 'Buku "Laskar Pelangi" berhasil dipinjam.', type: 'info', time: '1 jam yang lalu' },
        { id: 2, text: 'Tenggat pengembalian buku "Bumi Manusia" H-1.', type: 'warning', time: '3 jam yang lalu' },
        { id: 3, text: 'Stok buku "Cantik Itu Luka" telah diperbarui oleh Admin.', type: 'success', time: '1 hari yang lalu' }
    ];
    res.json({
        success: true,
        data: notifications
    });
});

// Home endpoint for testing connectivity
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Selamat datang di API Sistem Perpustakaan Digital.'
    });
});

// Route Fallback (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API tidak ditemukan.'
    });
});

// Global Error Handling Middleware (Dosen Requirement)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR HANDLED:', err.message || err);
    
    // Check if error is database-specific or custom
    const statusCode = err.status || 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan internal pada server.',
        // Hide details in production for security, expose in dev
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Start Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
