import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Membuat Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mengecek token saat aplikasi pertama kali dimuat (refresh browser)
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('pos_token');
            if (token) {
                try {
                    // Ekstrak payload dari token
                    const decoded = jwtDecode(token);
                    
                    // Cek apakah token sudah expired (JWT menggunakan format detik, JavaScript milidetik)
                    if (decoded.exp * 1000 < Date.now()) {
                        console.warn('Token expired. Melakukan logout otomatis.');
                        localStorage.removeItem('pos_token');
                        setUser(null);
                    } else {
                        // Jika valid, set data user ke global state
                        setUser(decoded);
                    }
                } catch (error) {
                    console.error('Token tidak valid');
                    localStorage.removeItem('pos_token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Fungsi untuk dipanggil setelah hit API Login berhasil
    const login = (token) => {
        localStorage.setItem('pos_token', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
    };

    // Fungsi untuk dipanggil saat kasir menekan tombol Logout
    const logout = () => {
        localStorage.removeItem('pos_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};