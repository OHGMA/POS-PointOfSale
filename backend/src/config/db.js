const mysql = require('mysql2/promise');

// Membuat Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Maksimal 10 koneksi yang terbuka bersamaan
    queueLimit: 0
});

// Test koneksi saat file ini pertama kali dipanggil
pool.getConnection()
    .then((connection) => {
        console.log('✅ Berhasil terhubung ke database MySQL!');
        connection.release(); // Kembalikan koneksi ke pool
    })
    .catch((err) => {
        console.error('❌ Gagal terhubung ke MySQL:', err.message);
    });

module.exports = pool;