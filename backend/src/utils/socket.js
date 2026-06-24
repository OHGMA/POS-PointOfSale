let io;

module.exports = {
    // Fungsi ini dipanggil sekali saat server pertama kali menyala
    init: (httpServer) => {
        const { Server } = require('socket.io');
        io = new Server(httpServer, {
            cors: {
                origin: "*", // Di production, ganti dengan URL frontend Vercel/domain aslimu
                methods: ["GET", "POST"]
            }
        });
        return io;
    },
    
    // Fungsi ini dipanggil oleh Service saat butuh mengirim pesan
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io belum diinisialisasi!');
        }
        return io;
    }
};