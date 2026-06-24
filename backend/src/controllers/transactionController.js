const transactionService = require('../services/transactionService');

const checkout = async (req, res) => {
    try {
        // userId diambil dari token JWT kasir yang sedang login
        const userId = req.user.id; 
        
        // items diharapkan berupa array of object: [{ productId: 1, quantity: 2 }, ...]
        const { items, paymentMethod } = req.body;

        // Validasi input dasar
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Keranjang belanja kosong atau format tidak valid' 
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Metode pembayaran wajib dipilih' 
            });
        }

        // Panggil service transaksi
        const transactionId = await transactionService.checkout(userId, items, paymentMethod);

        return res.status(201).json({
            success: true,
            message: 'Transaksi berhasil diselesaikan',
            data: { transactionId }
        });

    } catch (error) {
        // Membedakan HTTP Status Code:
        // Jika error karena stok kurang (aturan bisnis), kembalikan 400 Bad Request
        // Jika error karena database mati, kembalikan 500 Internal Server Error
        const isBusinessLogicError = error.message.includes('tidak mencukupi') || error.message.includes('tidak ditemukan');
        const statusCode = isBusinessLogicError ? 400 : 500;

        return res.status(statusCode).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    checkout
};