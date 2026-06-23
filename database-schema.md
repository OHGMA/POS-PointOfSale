# 1. users (Manajemen Akses)

    - id (PK)
    - name, email, password (hashed)
    - role (ENUM: 'admin', 'cashier')
    - created_at, updated_at, deleted_at

# 2. categories (Kategori Produk)

    - id (PK)
    - name
    - created_at, updated_at

# 3. products (Master Data Inventory)

    - id (PK)
    - category_id (FK -> categories.id)
    - name, sku (Barcode, Unique)
    - price (Harga saat ini)
    - stock (Stok real-time)
    - image_url
    - created_at, updated_at, deleted_at (Soft delete)

# 4. transactions (Header Transaksi)

    - id (PK)
    - user_id (FK -> users.id, kasir yang bertugas)
    - total_amount (Total harga setelah diskon)
    - discount
    - payment_method
    - created_at

# 5. transaction_details (Item dalam Transaksi)

    - id (PK)
    - transaction_id (FK -> transactions.id)
    - product_id (FK -> products.id)
    - quantity
    - price_at_transaction (Harga saat transaksi terjadi)
    - subtotal (quantity * price_at_transaction)

# 6. audit_logs (Rekam Jejak)

    - id (PK)
    - user_id (FK -> users.id, siapa yang melakukan)
    - action (Contoh: 'CREATE', 'UPDATE', 'DELETE')
    - entity (Contoh: 'Product')
    - entity_id (ID produk yang diubah)
    - old_values (JSON, null jika CREATE)
    - new_values (JSON, null jika DELETE)
    - created_at