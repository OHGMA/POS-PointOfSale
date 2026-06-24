const express = require('express');
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint: POST /api/transactions/checkout
// Kita menggunakan verifyToken agar sistem tahu ID Kasir yang bertugas, 
// tapi kita tidak menggunakan requireRole('admin') karena kasir biasa pun wajib bisa transaksi.
router.post('/checkout', verifyToken, transactionController.checkout);

module.exports = router;