require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Global Middlewares ---
app.use(helmet()); // Mengamankan header HTTP
app.use(cors()); // Mengizinkan akses dari frontend PWA kita nanti
app.use(morgan('dev')); // Logging HTTP request
app.use(express.json()); // Mem-parsing body request berupa JSON

// --- Routes Registration ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- Basic Health Check Route ---
// Route ini sering digunakan oleh AWS/Vercel/Docker untuk mengecek apakah server kita hidup
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'POS API is running smoothly!',
        timestamp: new Date().toISOString()
    });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});