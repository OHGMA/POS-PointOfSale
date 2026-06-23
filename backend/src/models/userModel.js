const db = require('../config/db');

// Mencari user berdasarkan email (Untuk proses Login)
const findByEmail = async (email) => {
    // Kita gunakan Prepared Statement (?) untuk mencegah SQL Injection
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', 
        [email]
    );
    return rows[0]; // Mengembalikan object user jika ada, atau undefined jika tidak
};

// Membuat user baru (Untuk seeding Admin pertama)
const create = async (userData) => {
    const { name, email, password, role } = userData;
    const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
    );
    return result.insertId; // Mengembalikan ID user yang baru dibuat
};

module.exports = {
    findByEmail,
    create
};