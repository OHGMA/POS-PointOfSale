import axios from 'axios';

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
    // Sesuaikan dengan URL backend-mu
    baseURL: 'http://localhost:5000/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor untuk REQUEST (Sebelum data dikirim ke backend)
api.interceptors.request.use(
    (config) => {
        // Ambil token dari local storage browser
        const token = localStorage.getItem('pos_token');
        
        // Jika token ada, otomatis suntikkan ke header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk RESPONSE (Setelah data diterima dari backend)
api.interceptors.response.use(
    (response) => {
        // Jika sukses (status 2xx), langsung kembalikan datanya
        return response;
    },
    (error) => {
        // Jika backend merespons dengan 401 (Unauthorized/Token Expired)
        if (error.response && error.response.status === 401) {
            console.error('Sesi telah habis. Silakan login kembali.');
            // Hapus token yang sudah basi
            localStorage.removeItem('pos_token');
            // Arahkan paksa user kembali ke halaman login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;