const Book = require('../models/bookModel');

class BookController {
    // Get all books with optional search filter and pagination
    static async getAllBooks(req, res, next) {
        try {
            const searchQuery = req.query.search || req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const { books, pagination } = await Book.findPaginated(searchQuery, page, limit);

            return res.status(200).json({
                success: true,
                count: books.length,
                data: books,
                pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single book details
    static async getBookById(req, res, next) {
        try {
            const { id } = req.params;
            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: `Buku dengan ID ${id} tidak ditemukan.`
                });
            }
            return res.status(200).json({
                success: true,
                data: book
            });
        } catch (error) {
            next(error);
        }
    }

    // Create a new book
    static async createBook(req, res, next) {
        try {
            const { judul, penulis, penerbit, tahun_terbit, stok } = req.body;

            // Form validation
            if (!judul || !penulis || !penerbit || !tahun_terbit || stok === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Semua field (judul, penulis, penerbit, tahun_terbit, stok) wajib diisi.'
                });
            }

            const parsedTahun = parseInt(tahun_terbit);
            const parsedStok = parseInt(stok);

            if (isNaN(parsedTahun) || isNaN(parsedStok) || parsedStok < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tahun terbit dan stok harus berupa angka valid (stok >= 0).'
                });
            }

            const bookId = await Book.create(judul, penulis, penerbit, parsedTahun, parsedStok);

            return res.status(201).json({
                success: true,
                message: 'Buku berhasil ditambahkan.',
                data: {
                    id: bookId,
                    judul,
                    penulis,
                    penerbit,
                    tahun_terbit: parsedTahun,
                    stok: parsedStok
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update an existing book
    static async updateBook(req, res, next) {
        try {
            const { id } = req.params;
            const { judul, penulis, penerbit, tahun_terbit, stok } = req.body;

            // Form validation
            if (!judul || !penulis || !penerbit || !tahun_terbit || stok === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Semua field (judul, penulis, penerbit, tahun_terbit, stok) wajib diisi.'
                });
            }

            const parsedTahun = parseInt(tahun_terbit);
            const parsedStok = parseInt(stok);

            if (isNaN(parsedTahun) || isNaN(parsedStok) || parsedStok < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tahun terbit dan stok harus berupa angka valid (stok >= 0).'
                });
            }

            // Check if book exists
            const existingBook = await Book.findById(id);
            if (!existingBook) {
                return res.status(404).json({
                    success: false,
                    message: `Buku dengan ID ${id} tidak ditemukan.`
                });
            }

            await Book.update(id, judul, penulis, penerbit, parsedTahun, parsedStok);

            return res.status(200).json({
                success: true,
                message: 'Buku berhasil diperbarui.',
                data: {
                    id: parseInt(id),
                    judul,
                    penulis,
                    penerbit,
                    tahun_terbit: parsedTahun,
                    stok: parsedStok
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete a book
    static async deleteBook(req, res, next) {
        try {
            const { id } = req.params;

            // Check if book exists
            const existingBook = await Book.findById(id);
            if (!existingBook) {
                return res.status(404).json({
                    success: false,
                    message: `Buku dengan ID ${id} tidak ditemukan.`
                });
            }

            await Book.delete(id);

            return res.status(200).json({
                success: true,
                message: 'Buku berhasil dihapus.'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookController;
