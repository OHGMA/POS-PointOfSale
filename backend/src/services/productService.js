const productModel = require('../models/productModel');
const auditModel = require('../models/auditModel');

const getProducts = async (page = 1, limit = 10) => {
    // Kalkulasi offset untuk query database
    const offset = (page - 1) * limit;
    
    const products = await productModel.findAll(limit, offset);
    const totalItems = await productModel.countAll();
    
    return {
        data: products,
        meta: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total_items: totalItems,
            total_pages: Math.ceil(totalItems / limit)
        }
    };
};

const createProduct = async (userId, productData) => {
    // 1. Simpan produk ke database
    const newProductId = await productModel.create(productData);
    
    // 2. Catat aktivitas ini ke Audit Log
    await auditModel.logAction(
        userId, 
        'CREATE', 
        'Product', 
        newProductId, 
        null, // Tidak ada nilai lama karena ini data baru
        productData
    );
    
    return newProductId;
};

const updateProduct = async (userId, productId, productData) => {
    // 1. Ambil data produk yang lama (sebelum diubah) untuk keperluan log
    const oldProduct = await productModel.findById(productId);
    if (!oldProduct) {
        throw new Error('Produk tidak ditemukan');
    }

    // 2. Lakukan update
    await productModel.update(productId, productData);
    
    // 3. Catat perubahan ke Audit Log
    await auditModel.logAction(
        userId, 
        'UPDATE', 
        'Product', 
        productId, 
        oldProduct, // Simpan state lama
        productData // Simpan state baru
    );
};

const deleteProduct = async (userId, productId) => {
    const oldProduct = await productModel.findById(productId);
    if (!oldProduct) {
        throw new Error('Produk tidak ditemukan');
    }

    // Lakukan soft delete
    await productModel.softDelete(productId);
    
    // Catat ke Audit Log
    await auditModel.logAction(
        userId, 
        'DELETE', 
        'Product', 
        productId, 
        oldProduct, 
        { deleted_at: new Date().toISOString() }
    );
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};