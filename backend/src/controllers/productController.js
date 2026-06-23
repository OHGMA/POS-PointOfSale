const productService = require('../services/productService');

const getAll = async (req, res) => {
    try {
        // Ambil query parameter untuk paginasi (misal: /api/products?page=2&limit=20)
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        const result = await productService.getProducts(page, limit);

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data produk',
            ...result // Menyebarkan (spread) object data dan meta
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        // req.user.id didapatkan dari token JWT (Auth Middleware)
        const userId = req.user.id; 
        const productData = req.body;

        // Validasi input sederhana
        if (!productData.category_id || !productData.name || !productData.sku || !productData.price) {
            return res.status(400).json({ success: false, message: 'Data produk tidak lengkap' });
        }

        const newProductId = await productService.createProduct(userId, productData);

        return res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan',
            data: { id: newProductId }
        });
    } catch (error) {
        // Error ER_DUP_ENTRY biasanya muncul jika SKU sudah ada di database (Unique constraint)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'SKU produk sudah terdaftar' });
        }
        return res.status(500).json({ success: false, message: 'Gagal menambah produk', error: error.message });
    }
};

// ... (Untuk mempersingkat, kita implementasikan Read dan Create dulu. Update dan Delete mengikuti pola yang sama).

module.exports = {
    getAll,
    create
};