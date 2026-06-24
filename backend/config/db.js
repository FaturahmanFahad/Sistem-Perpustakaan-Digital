const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpus_digital',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to promise-based wrapper
const db = pool.promise();

// Test the database connection
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully to ' + (process.env.DB_NAME || 'perpus_digital'));
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });

module.exports = db;
