const express = require('express');
const productController = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint: GET /api/products
// Semua user yang sudah login (Admin & Cashier) bisa melihat daftar produk
router.get('/', verifyToken, productController.getAll);

// Endpoint: POST /api/products
// HANYA Admin yang bisa menambah produk baru
router.post('/', verifyToken, requireRole('admin'), productController.create);

// (Opsional untuk dilanjutkan nanti: rute PUT dan DELETE dengan proteksi admin)

module.exports = router;