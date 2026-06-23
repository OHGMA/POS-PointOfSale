# 1. Requirement Analysis (Analisis Kebutuhan)

## Functional Requirements (Fitur Inti):

1. RBAC (Role-Based Access Control): Sistem harus bisa membedakan permission Admin (bisa CRUD produk & lihat dashboard) dan Cashier (hanya bisa melakukan transaksi).

2. Inventory Management: Produk harus memiliki track record (Audit Log) setiap kali ada perubahan data atau stok.

3. Point of Sale: Sistem transaksi yang harus cepat.

4. Real-time & Offline-first: Ini kontradiktif namun krusial. Sistem harus real-time saat online, tapi tetap bisa menampung antrean transaksi (queue) saat internet mati, lalu melakukan sinkronisasi saat koneksi pulih.

## Non-Functional Requirements (Kualitas Sistem):

1. Data Integrity & Concurrency: Apa yang terjadi jika ada dua kasir di cabang berbeda mencoba membeli barang sisa 1 secara bersamaan? Kita butuh Transaction Handling (ACID properties di MySQL) dan Pessimistic/Optimistic Locking.

2. Performance: UI tidak boleh lagging saat kasir mencari produk dengan mengetik barcode atau nama.

3. Security: API tidak boleh bisa ditembus dengan manipulasi token atau SQL Injection.

# 2. Architecture Design (Client-Server)

Kita akan menggunakan arsitektur Decoupled Client-Server. Frontend dan Backend akan menjadi dua entitas (dan repository) yang sepenuhnya terpisah.

## Trade-off & Alasan Desain:

### Why Decoupled (API-Driven) ? 

Karena kita menargetkan aplikasi yang Offline-first (PWA). PWA mensyaratkan Frontend berjalan mandiri di browser (React SPA) dan hanya berkomunikasi via data (JSON) dengan backend.

### Why MySQL? 

Transaksi POS membutuhkan relasi data yang kuat (Produk, Kategori, Transaksi, Detail Transaksi) dan guarantee ACID untuk integritas keuangan. Database NoSQL seperti MongoDB kurang ideal untuk struktur data relasional yang ketat seperti ini.

### Why Express.js? 

Node.js menggunakan event-driven, non-blocking I/O. Ini sangat optimal untuk menangani koneksi real-time (WebSockets/Socket.io) secara bersamaan tanpa membebani memori server terlalu besar dibandingkan arsitektur thread-per-request.

# 3. High-Level System Design

Sistem kita akan terdiri dari 4 komponen utama:

- Frontend (PWA client) : React.js + Service Workers (untuk offline caching dan antrean API).

- Backend (API Gateway & Logic) : Node.js + Express.js + Socket.io (untuk notifikasi stok real-time).

- Database : MySQL (menyimpan source of truth).

- Cache/Queue (Opsional/Masa Depan) : Redis (kita skip dulu di awal agar tidak over-engineering, kita gunakan MySQL transaction untuk awal).

# 4. Identifikasi Module Utama

Kita akan membagi sistem menjadi domain/modul mandiri (mengadopsi pendekatan Domain-Driven Design skala kecil):

- Auth Module : Mengurus login, hashing password (Bcrypt), dan penerbitan JWT.

- Product & Inventory Module : Mengurus CRUD produk, kategori, dan Audit Log.

- Transaction Module : Mengurus pembuatan invoice, kalkulasi diskon, pemotongan stok aman (concurrency), dan penyimpanan riwayat.

- Reporting Module : Agregasi data untuk Dashboard (perlu query yang dioptimasi agar tidak membebani database utama jika data membesar).

# 5. Roadmap Development End-to-End

Ini adalah blueprint perjalanan kita:

- Phase 1: Requirement Analysis & System Design

- Phase 2: Database Design & Normalization (ERD, Relasi, Indeks)

- Phase 3: Backend Foundation (Project Structure, Error Handling, Logging)

- Phase 4: Authentication & Security (JWT, Middleware, RBAC)

- Phase 5: Product & Audit API (CRUD, File Upload, Pagination)

- Phase 6: Transaction API & Concurrency (MySQL Transactions, Realtime Events)

- Phase 7: Frontend Foundation & Routing (React Setup, Axios instance)

- Phase 8: Frontend UI & State Management (Auth flow, POS interface)

- Phase 9: Real-time & Advanced Features (Socket.io integration, Alerts)

- Phase 10: Offline-First & PWA (Service Workers, IndexedDB untuk local state)

- Phase 11: Deployment & CI/CD (Vercel, Railway/Render untuk Backend)