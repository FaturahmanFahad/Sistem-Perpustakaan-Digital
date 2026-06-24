const db = require('../config/db');

class User {
    // Constructor representing User entity
    constructor(id, username, email, password, role, created_at) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.created_at = created_at;
    }

    // Static method to find a user by their email
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) return null;
            
            const u = rows[0];
            return new User(u.id, u.username, u.email, u.password, u.role, u.created_at);
        } catch (error) {
            throw error;
        }
    }

    // Static method to create a new user record
    static async create(username, email, hashedPassword, role = 'user') {
        try {
            const [result] = await db.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, role]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
