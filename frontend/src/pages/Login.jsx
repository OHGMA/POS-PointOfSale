import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Hooks untuk navigasi halaman
    const navigate = useNavigate();
    // Tarik fungsi login dari global state
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault(); // Mencegah browser refresh saat form di-submit
        setError('');
        setIsLoading(true);

        try {
            // Hit API backend yang sudah kita buat di Phase 4
            const response = await api.post('/auth/login', { email, password });
            
            // Jika sukses, masukkan token ke Context
            login(response.data.data.token);
            
            // Arahkan kasir ke halaman utama POS
            navigate('/');
        } catch (err) {
            // Tangkap pesan error dari backend (misal: "Email atau password salah")
            setError(err.response?.data?.message || 'Terjadi kesalahan pada server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>POS Login</h2>
                
                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: isLoading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontWeight: 'bold' }}
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}