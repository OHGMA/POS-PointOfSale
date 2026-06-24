import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';

// Komponen Penjaga Pintu (High-Order Component)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Tunggu sampai pengecekan token di local storage selesai
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>Loading sistem...</div>;
    }

    // Jika tidak ada data user login, tendang ke /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Jika aman, render halaman yang diminta
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rute Publik */}
                <Route path="/login" element={<Login />} />

                {/* Rute Terproteksi */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            {/* Nanti ini akan diganti dengan komponen halaman POS sungguhan */}
                            <div style={{ padding: '2rem' }}>
                                <h1>Selamat datang di Sistem POS</h1>
                                <p>Halaman ini aman dan hanya bisa dilihat oleh kasir/admin yang sudah login.</p>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('pos_token');
                                        window.location.reload();
                                    }}>Logout</button>
                            </div>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;