const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Ambil header Authorization
    const authHeader = req.headers.authorization;

    // 2. Cek apakah header ada dan formatnya "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak. Token tidak ditemukan.' 
        });
    }

    // 3. Ekstrak token (ambil string setelah kata "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verifikasi keaslian token menggunakan secret key kita
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Simpan data user dari payload token ke dalam request object
        // Ini berguna agar Controller selanjutnya tahu siapa yang sedang request
        req.user = decoded;

        // 6. Izinkan request lanjut ke Controller
        next();
    } catch (error) {
        // Jika token palsu, diubah isinya, atau sudah expired
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid atau sudah kedaluwarsa.' 
        });
    }
};

// Middleware tambahan untuk membatasi aksi berdasarkan Role (RBAC)
const requireRole = (role) => {
    return (req, res, next) => {
        // req.user sudah diisi oleh verifyToken di atas
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden. Anda tidak memiliki izin untuk aksi ini.' 
            });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    requireRole
};