const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Service untuk Login
const login = async (email, password) => {
    // 1. Cek apakah user ada di database
    const user = await userModel.findByEmail(email);
    if (!user) {
        throw new Error('Email atau password salah'); // Sengaja tidak spesifik demi keamanan
    }

    // 2. Verifikasi password (bandingkan teks asli dengan hash di database)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Email atau password salah');
    }

    // 3. Buat JWT Payload (data yang disisipkan ke dalam token)
    // JANGAN PERNAH memasukkan password ke dalam payload!
    const payload = {
        id: user.id,
        role: user.role
    };

    // 4. Generate Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Kembalikan data user (tanpa password) dan token
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    };
};

// Service untuk membuat Admin pertama (Hanya dipakai sekali/sementara)
const registerAdmin = async (userData) => {
    // Hash password sebelum disimpan (Gunakan Salt Rounds: 10)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
        ...userData,
        password: hashedPassword,
        role: 'admin' // Force role menjadi admin
    };

    const insertId = await userModel.create(newUser);
    return insertId;
};

module.exports = {
    login,
    registerAdmin
};