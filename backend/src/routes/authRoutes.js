const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Endpoint: POST /api/auth/setup
// Hanya digunakan sekali untuk membuat akun admin pertama
router.post('/setup', authController.setupAdmin);

// Endpoint: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;