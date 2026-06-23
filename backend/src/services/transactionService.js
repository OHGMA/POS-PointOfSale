const db = require('../config/db');

const checkout = async (userId, items, paymentMethod) => {
    // 1. Pinjam satu koneksi khusus dari pool
    const connection = await db.getConnection();

    try {
        // 2. Mulai mode Transaksi (Atomicity)
        await connection.beginTransaction();

        let totalAmount = 0;
        const transactionDetails = [];

        // 3. Proses setiap barang di keranjang
        for (const item of items) {
            // Pessimistic Locking: Tambahkan FOR UPDATE di akhir query
            const [productRows] = await connection.execute(
                'SELECT id, price, stock FROM products WHERE id = ? AND deleted_at IS NULL FOR UPDATE',
                [item.productId]
            );

            if (productRows.length === 0) {
                throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
            }

            const product = productRows[0];

            // Cek ketersediaan stok
            if (product.stock < item.quantity) {
                throw new Error(`Stok tidak mencukupi untuk produk ID ${item.productId}. Stok tersisa: ${product.stock}`);
            }

            // Potong stok di database
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, product.id]
            );

            // Kalkulasi subtotal berdasarkan harga saat ini (Snapshot/Historical Data)
            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            // Simpan detail untuk di-insert nanti
            transactionDetails.push({
                productId: product.id,
                quantity: item.quantity,
                priceAtTransaction: product.price,
                subtotal: subtotal
            });
        }

        // 4. Simpan Header Transaksi
        const [transResult] = await connection.execute(
            'INSERT INTO transactions (user_id, total_amount, payment_method) VALUES (?, ?, ?)',
            [userId, totalAmount, paymentMethod]
        );
        const transactionId = transResult.insertId;

        // 5. Simpan Detail Transaksi
        for (const detail of transactionDetails) {
            await connection.execute(
                'INSERT INTO transaction_details (transaction_id, product_id, quantity, price_at_transaction, subtotal) VALUES (?, ?, ?, ?, ?)',
                [transactionId, detail.productId, detail.quantity, detail.priceAtTransaction, detail.subtotal]
            );
        }

        // 6. Jika semua query di atas berhasil, simpan permanen ke database
        await connection.commit();
        
        return transactionId;

    } catch (error) {
        // Jika ada SATU SAJA error (stok kurang, database mati, dll), BATALKAN SEMUA query sebelumnya
        await connection.rollback();
        throw error; // Lempar error ke Controller
    } finally {
        // 7. WAJIB: Kembalikan koneksi ke pool agar tidak terjadi Memory Leak
        connection.release();
    }
};

module.exports = {
    checkout
};