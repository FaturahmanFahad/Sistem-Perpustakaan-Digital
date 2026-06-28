const Borrowing = require('../models/borrowingModel');

class BorrowingController {
    // User borrows a book
    static async borrowBook(req, res, next) {
        try {
            const { bookId, durasi } = req.body;
            const userId = req.user.id; // From verifyToken middleware

            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID Buku wajib disertakan.'
                });
            }

            const pinjamDate = new Date();
            const tanggalPinjam = pinjamDate.toISOString().split('T')[0]; // YYYY-MM-DD
            
            const days = parseInt(durasi) || 7;
            const tenggatDate = new Date();
            tenggatDate.setDate(pinjamDate.getDate() + days);
            const tanggalTenggat = tenggatDate.toISOString().split('T')[0]; // YYYY-MM-DD
            
            const borrowingId = await Borrowing.create(userId, bookId, tanggalPinjam, tanggalTenggat);
            
            return res.status(201).json({
                success: true,
                message: 'Buku berhasil dipinjam.',
                data: {
                    id: borrowingId,
                    userId,
                    bookId,
                    tanggalPinjam,
                    tanggalTenggat,
                    status: 'dipinjam'
                }
            });
        } catch (error) {
            // Check for custom error thrown in Model transaction block
            if (error.message === 'Buku tidak ditemukan.' || error.message === 'Stok buku habis.') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // User returns a book
    static async returnBook(req, res, next) {
        try {
            const { id } = req.params; // Borrowing transaction ID
            
            const tanggalKembali = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Check if borrowing exists first
            const borrowing = await Borrowing.findById(id);
            if (!borrowing) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaksi peminjaman tidak ditemukan.'
                });
            }

            // Authorization: normal users can only return their own borrowings, Admins can return any
            if (req.user.role !== 'admin' && borrowing.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Akses ditolak. Anda tidak berhak melakukan pengembalian untuk transaksi ini.'
                });
            }

            await Borrowing.returnBook(id, tanggalKembali);

            return res.status(200).json({
                success: true,
                message: 'Buku berhasil dikembalikan.',
                data: {
                    id: parseInt(id),
                    tanggalKembali,
                    status: 'kembali'
                }
            });
        } catch (error) {
            if (error.message === 'Transaksi peminjaman tidak ditemukan.' || error.message === 'Buku ini sudah dikembalikan.') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // View personal borrowing history (User)
    static async getMyBorrowings(req, res, next) {
        try {
            const userId = req.user.id;
            const history = await Borrowing.findByUserId(userId);
            return res.status(200).json({
                success: true,
                count: history.length,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    // View all borrowing records (Admin)
    static async getAllBorrowings(req, res, next) {
        try {
            const borrowings = await Borrowing.findAll();
            return res.status(200).json({
                success: true,
                count: borrowings.length,
                data: borrowings
            });
        } catch (error) {
            next(error);
        }
    }

    // View Library Stats dashboard
    static async getLibraryStats(req, res, next) {
        try {
            const stats = await Borrowing.getStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BorrowingController;
