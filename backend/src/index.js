require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Global Middlewares ---
app.use(helmet()); // Mengamankan header HTTP
// Ubah bagian app.use(cors()) menjadi:
app.use(cors({
    origin: '*', // Untuk awal production, biarkan '*' (semua domain diizinkan). Nanti di dunia nyata, ganti dengan URL spesifik Vercel-mu.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(morgan('dev')); // Logging HTTP request
app.use(express.json()); // Mem-parsing body request berupa JSON

// --- Routes Registration ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // Import rute produk
const transactionRoutes = require('./routes/transactionRoutes'); // Import rute transaksi

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Daftarkan rute produk
app.use('/api/transactions', transactionRoutes); // Daftarkan rute transaksi

// --- Basic Health Check Route ---
// Route ini sering digunakan oleh AWS/Vercel/Docker untuk mengecek apakah server kita hidup
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'POS API is running smoothly!',
        timestamp: new Date().toISOString()
    });
});

// Import module socket yang baru kita buat
const socketUtil = require('./utils/socket');
const http = require('http');

// --- Server & Socket Initialization ---
const PORT = process.env.PORT || 5000;

// Bungkus app Express kita dengan HTTP module bawaan Node.js
const server = http.createServer(app);

// Inisialisasi Socket.io
const io = socketUtil.init(server);

// Dengarkan event koneksi dari client (Frontend)
io.on('connection', (socket) => {
    console.log(`🔌 Client terhubung dengan ID Socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client terputus: ${socket.id}`);
    });
});

// GANTI app.listen menjadi server.listen
server.listen(PORT, () => {
    console.log(`🚀 Server berjalan pada http://localhost:${PORT}`);
});