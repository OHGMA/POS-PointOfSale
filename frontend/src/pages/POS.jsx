import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

export default function POS() {
    const { user, logout } = useContext(AuthContext);
    
    // State Management
    const [products, setProducts] = useState([]);
    // 1. Ubah inisialisasi state cart
    // Alih-alih mulai dari [], kita minta React mengecek localStorage dulu
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('pos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Tambahkan useEffect baru khusus untuk memantau 'cart'
    // Setiap kali isi cart berubah (ditambah/dikurangi), otomatis simpan ke localStorage
    useEffect(() => {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
    }, [cart]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isLoading, setIsLoading] = useState(false);

    // 1. Fetch Data Awal & Setup WebSocket
    useEffect(() => {
        fetchProducts();

        // Hubungkan ke server Socket.io (sesuaikan port backend-mu)
        const socket = io('http://localhost:5000');

        // Dengarkan event dari backend saat ada transaksi di kasir lain
        socket.on('stock_updated', (data) => {
            console.log('Notifikasi Real-time diterima:', data.message);
            // Refresh daftar produk agar stok terbaru muncul
            fetchProducts();
        });

        // Cleanup: putuskan koneksi socket saat komponen di-unmount (halaman ditutup)
        return () => socket.disconnect();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil produk:', error);
        }
    };

    // 2. Logika Keranjang Belanja (Cart)
    const addToCart = (product) => {
        if (product.stock === 0) {
            alert('Stok habis!');
            return;
        }

        setCart((prevCart) => {
            // Cek apakah barang sudah ada di keranjang
            const existingItem = prevCart.find((item) => item.productId === product.id);
            
            if (existingItem) {
                // Jangan izinkan nambah kalau melebihi stok
                if (existingItem.quantity >= product.stock) {
                    alert('Kuantitas melebihi stok tersedia!');
                    return prevCart;
                }
                // Jika ada, tambah quantity-nya
                return prevCart.map((item) => 
                    item.productId === product.id 
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
                        : item
                );
            } else {
                // Jika belum ada, masukkan barang baru ke array keranjang
                return [...prevCart, { 
                    productId: product.id, 
                    name: product.name,
                    price: product.price, 
                    quantity: 1,
                    subtotal: product.price
                }];
            }
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // 3. Logika Checkout (Mengirim ke Backend)
    // Logika Checkout yang sudah di-upgrade
    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Keranjang kosong!');
        
        setIsLoading(true);
        const payload = {
            items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
            paymentMethod: paymentMethod
        };

        try {
            await api.post('/transactions/checkout', payload);
            
            alert('Transaksi Berhasil!');
            setCart([]); // Kosongkan keranjang
        } catch (error) {
            // PENTING: Jika error tidak memiliki response, berarti aplikasi gagal menghubungi server (Offline)
            if (!error.response) {
                alert('🌐 Anda sedang offline! Transaksi diamankan ke antrean lokal dan akan dikirim saat internet kembali.');
                
                // Ambil antrean lama, tambah transaksi baru, simpan lagi
                const offlineQueue = JSON.parse(localStorage.getItem('pos_offline_queue') || '[]');
                offlineQueue.push({ ...payload, timestamp: new Date().getTime() });
                localStorage.setItem('pos_offline_queue', JSON.stringify(offlineQueue));
                
                setCart([]); // Tetap kosongkan keranjang agar kasir bisa lanjut melayani pelanggan berikutnya
            } else {
                // Ini error dari backend (misal: stok habis)
                alert(error.response?.data?.message || 'Gagal melakukan transaksi');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Tambahkan useEffect ini untuk mendeteksi internet menyala (Background Sync)
    useEffect(() => {
        const handleOnline = async () => {
            console.log('🌐 Koneksi internet pulih. Memeriksa antrean transaksi...');
            const offlineQueue = JSON.parse(localStorage.getItem('pos_offline_queue') || '[]');
            
            if (offlineQueue.length > 0) {
                // Kirim semua transaksi yang tertunda satu per satu
                for (const payload of offlineQueue) {
                    try {
                        await api.post('/transactions/checkout', payload);
                    } catch (err) {
                        console.error('Gagal sinkronisasi transaksi lama:', err);
                    }
                }
                
                // Bersihkan antrean lokal setelah sukses dikirim
                localStorage.removeItem('pos_offline_queue');
                alert('✅ Data transaksi offline berhasil disinkronkan ke server!');
                fetchProducts(); // Refresh stok ke versi terbaru server
            }
        };

        // Pasang "telinga" ke browser untuk mendeteksi event 'online'
        window.addEventListener('online', handleOnline);
        
        // Cleanup listener saat komponen ditutup
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Kiri: Daftar Produk */}
            <div style={{ flex: 2, padding: '1.5rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2>Kasir POS - {user?.name}</h2>
                    <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {products.map((p) => (
                        <div 
                            key={p.id} 
                            onClick={() => addToCart(p)}
                            style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', opacity: p.stock === 0 ? 0.5 : 1 }}
                        >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{p.name}</h4>
                            <p style={{ margin: 0, color: '#2563eb', fontWeight: 'bold' }}>Rp {p.price}</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: p.stock < 5 ? 'red' : 'gray' }}>
                                Stok: {p.stock}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kanan: Keranjang & Checkout */}
            <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e5e7eb' }}>
                <h3>Keranjang</h3>
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                    {cart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            <div>
                                <strong>{item.name}</strong>
                                <div style={{ fontSize: '0.875rem', color: 'gray' }}>{item.quantity} x Rp {item.price}</div>
                            </div>
                            <strong>Rp {item.subtotal}</strong>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total:</span>
                        <span>Rp {cartTotal}</span>
                    </div>
                </div>

                <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px' }}
                >
                    <option value="CASH">Tunai (Cash)</option>
                    <option value="GOPAY">GoPay</option>
                    <option value="QRIS">QRIS</option>
                </select>

                <button 
                    onClick={handleCheckout} 
                    disabled={isLoading || cart.length === 0}
                    style={{ padding: '1rem', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: (isLoading || cart.length === 0) ? 'not-allowed' : 'pointer' }}
                >
                    {isLoading ? 'Memproses...' : 'BAYAR SEKARANG'}
                </button>
            </div>
        </div>
    );
}