const db = require('../config/db');

class Book {
    constructor(id, judul, penulis, penerbit, tahun_terbit, stok, created_at) {
        this.id = id;
        this.judul = judul;
        this.penulis = penulis;
        this.penerbit = penerbit;
        this.tahun_terbit = tahun_terbit;
        this.stok = stok;
        this.created_at = created_at;
    }

    // Fetch all books (with optional search keyword filter)
    static async findAll(searchQuery = '') {
        try {
            let sql = 'SELECT * FROM books';
            let params = [];

            if (searchQuery) {
                sql += ' WHERE judul LIKE ? OR penulis LIKE ? OR penerbit LIKE ?';
                const likeQuery = `%${searchQuery}%`;
                params = [likeQuery, likeQuery, likeQuery];
            }

            const [rows] = await db.query(sql, params);
            return rows.map(b => new Book(b.id, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.stok, b.created_at));
        } catch (error) {
            throw error;
        }
    }

    // Fetch details of a single book by ID
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            
            const b = rows[0];
            return new Book(b.id, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.stok, b.created_at);
        } catch (error) {
            throw error;
        }
    }

    // Insert a new book record
    static async create(judul, penulis, penerbit, tahun_terbit, stok) {
        try {
            const [result] = await db.query(
                'INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES (?, ?, ?, ?, ?)',
                [judul, penulis, penerbit, tahun_terbit, stok]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing book record
    static async update(id, judul, penulis, penerbit, tahun_terbit, stok) {
        try {
            const [result] = await db.query(
                'UPDATE books SET judul = ?, penulis = ?, penerbit = ?, tahun_terbit = ?, stok = ? WHERE id = ?',
                [judul, penulis, penerbit, tahun_terbit, stok, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete a book record by ID
    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Book;
