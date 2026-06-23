const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        // Tangkap input dari user
        const { email, password } = req.body;

        // Validasi input dasar
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
        }

        // Panggil service
        const result = await authService.login(email, password);

        // Kirim response sukses (Status 200 OK)
        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: result
        });
    } catch (error) {
        // Tangkap error dari service (misal: password salah)
        // Status 401 Unauthorized
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const setupAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
        }

        const newUserId = await authService.registerAdmin({ name, email, password });

        return res.status(201).json({ // Status 201 Created
            success: true,
            message: 'Admin berhasil dibuat',
            data: { userId: newUserId }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal membuat admin', error: error.message });
    }
};

module.exports = {
    login,
    setupAdmin
};