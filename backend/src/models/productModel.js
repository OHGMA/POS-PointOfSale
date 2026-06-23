const db = require('../config/db');

// Read: Mengambil semua produk dengan pagination dan MENGABAIKAN yang sudah dihapus
const findAll = async (limit, offset) => {
    const [rows] = await db.execute(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         WHERE p.deleted_at IS NULL 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit.toString(), offset.toString()] // Parameter LIMIT/OFFSET di mysql2 harus berupa string angka
    );
    return rows;
};

// Menghitung total produk aktif (dibutuhkan untuk informasi total halaman di frontend)
const countAll = async () => {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL');
    return rows[0].total;
};

// Read: Mengambil satu produk berdasarkan ID
const findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
};

// Create: Menambah produk baru
const create = async (productData) => {
    const { category_id, name, sku, price, stock, image_url } = productData;
    const [result] = await db.execute(
        `INSERT INTO products (category_id, name, sku, price, stock, image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [category_id, name, sku, price, stock, image_url]
    );
    return result.insertId;
};

// Update: Mengubah data produk
const update = async (id, productData) => {
    const { category_id, name, sku, price, stock, image_url } = productData;
    await db.execute(
        `UPDATE products 
         SET category_id = ?, name = ?, sku = ?, price = ?, stock = ?, image_url = ? 
         WHERE id = ?`,
        [category_id, name, sku, price, stock, image_url, id]
    );
};

// Delete: Soft Delete produk
const softDelete = async (id) => {
    await db.execute('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

module.exports = {
    findAll,
    countAll,
    findById,
    create,
    update,
    softDelete
};