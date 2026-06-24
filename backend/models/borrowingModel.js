const db = require('../config/db');

class Borrowing {
    constructor(id, user_id, book_id, tanggal_pinjam, tanggal_kembali, status, username, judul, created_at) {
        this.id = id;
        this.user_id = user_id;
        this.book_id = book_id;
        this.tanggal_pinjam = tanggal_pinjam;
        this.tanggal_kembali = tanggal_kembali;
        this.status = status;
        this.username = username; // Joined field
        this.judul = judul;       // Joined field
        this.created_at = created_at;
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT br.*, u.username, b.judul 
                 FROM borrowings br
                 JOIN users u ON br.user_id = u.id
                 JOIN books b ON br.book_id = b.id
                 WHERE br.id = ?`,
                [id]
            );
            if (rows.length === 0) return null;
            const r = rows[0];
            return new Borrowing(r.id, r.user_id, r.book_id, r.tanggal_pinjam, r.tanggal_kembali, r.status, r.username, r.judul, r.created_at);
        } catch (error) {
            throw error;
        }
    }

    // Get all borrowings in the system (Admin overview)
    static async findAll() {
        try {
            const [rows] = await db.query(
                `SELECT br.*, u.username, b.judul 
                 FROM borrowings br
                 JOIN users u ON br.user_id = u.id
                 JOIN books b ON br.book_id = b.id
                 ORDER BY br.tanggal_pinjam DESC`
            );
            return rows.map(r => new Borrowing(r.id, r.user_id, r.book_id, r.tanggal_pinjam, r.tanggal_kembali, r.status, r.username, r.judul, r.created_at));
        } catch (error) {
            throw error;
        }
    }

    // Get borrowing history of a specific user
    static async findByUserId(userId) {
        try {
            const [rows] = await db.query(
                `SELECT br.*, u.username, b.judul 
                 FROM borrowings br
                 JOIN users u ON br.user_id = u.id
                 JOIN books b ON br.book_id = b.id
                 WHERE br.user_id = ?
                 ORDER BY br.tanggal_pinjam DESC`,
                [userId]
            );
            return rows.map(r => new Borrowing(r.id, r.user_id, r.book_id, r.tanggal_pinjam, r.tanggal_kembali, r.status, r.username, r.judul, r.created_at));
        } catch (error) {
            throw error;
        }
    }

    // Create a borrowing record (decrements stock by 1)
    static async create(userId, bookId, tanggalPinjam) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check book stock
            const [books] = await connection.query('SELECT stok FROM books WHERE id = ? FOR UPDATE', [bookId]);
            if (books.length === 0) {
                throw new Error('Buku tidak ditemukan.');
            }
            if (books[0].stok <= 0) {
                throw new Error('Stok buku habis.');
            }

            // 2. Insert borrowing record
            const [result] = await connection.query(
                'INSERT INTO borrowings (user_id, book_id, tanggal_pinjam, status) VALUES (?, ?, ?, ?)',
                [userId, bookId, tanggalPinjam, 'dipinjam']
            );

            // 3. Decrement book stock
            await connection.query('UPDATE books SET stok = stok - 1 WHERE id = ?', [bookId]);

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Return a book (sets status to 'kembali' and increments stock by 1)
    static async returnBook(borrowingId, tanggalKembali) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check borrowing status
            const [borrowings] = await connection.query('SELECT * FROM borrowings WHERE id = ? FOR UPDATE', [borrowingId]);
            if (borrowings.length === 0) {
                throw new Error('Transaksi peminjaman tidak ditemukan.');
            }
            if (borrowings[0].status === 'kembali') {
                throw new Error('Buku ini sudah dikembalikan.');
            }

            const bookId = borrowings[0].book_id;

            // 2. Update borrowing status & date
            await connection.query(
                'UPDATE borrowings SET status = ?, tanggal_kembali = ? WHERE id = ?',
                ['kembali', tanggalKembali, borrowingId]
            );

            // 3. Increment book stock
            await connection.query('UPDATE books SET stok = stok + 1 WHERE id = ?', [bookId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get summary statistics
    static async getStats() {
        try {
            const [[{ total_books }]] = await db.query('SELECT COUNT(*) as total_books FROM books');
            const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
            const [[{ active_borrowings }]] = await db.query('SELECT COUNT(*) as active_borrowings FROM borrowings WHERE status = "dipinjam"');
            const [[{ total_borrowings }]] = await db.query('SELECT COUNT(*) as total_borrowings FROM borrowings');

            return {
                total_books,
                total_users,
                active_borrowings,
                total_borrowings
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Borrowing;
