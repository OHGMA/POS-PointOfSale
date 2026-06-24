import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import POS from './pages/POS'; // 1. Import komponen POS

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
                <Route path="/login" element={<Login />} />

                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            {/* 2. Ganti div dummy dengan komponen POS kita */}
                            <POS />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;