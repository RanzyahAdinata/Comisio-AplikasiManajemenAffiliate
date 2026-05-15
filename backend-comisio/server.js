const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Koneksi PostgreSQL
const pool = process.env.DATABASE_URL ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}) : new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'comisio',
    password: '12345.',
    port: 5432,
});

// Tes Koneksi Database
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Gagal koneksi ke database:', err.stack);
    }
    console.log('Berhasil terhubung ke database PostgreSQL (comisio)');
    release();
});

// ==========================================
// HELPER: Generate Referral Code
// ==========================================
function generateReferralCode(firstName, productId) {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const prefix = (firstName || 'REF').substring(0, 3).toUpperCase();
    return `${prefix}-${random}`;
}

// ==========================================
// ENDPOINT SIGN UP (REGISTRASI USER BARU)
// ==========================================
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    // ── VALIDASI INPUT ──────────────────────────────────────────────
    const errors = [];

    // Cek field wajib tidak kosong
    if (!firstName || firstName.trim().length === 0) {
        errors.push('First name tidak boleh kosong.');
    } else if (firstName.trim().length < 2) {
        errors.push('First name minimal 2 karakter.');
    }

    if (!lastName || lastName.trim().length === 0) {
        errors.push('Last name tidak boleh kosong.');
    } else if (lastName.trim().length < 2) {
        errors.push('Last name minimal 2 karakter.');
    }

    if (!email || email.trim().length === 0) {
        errors.push('Email tidak boleh kosong.');
    } else {
        // Validasi format email menggunakan regex untuk gmail
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email.trim().toLowerCase())) {
            errors.push('Format email tidak valid. Harus menggunakan @gmail.com');
        }
    }

    if (!password || password.length === 0) {
        errors.push('Password tidak boleh kosong.');
    } else if (password.length < 6) {
        errors.push(`Password terlalu pendek (${password.length} karakter). Minimal 6 karakter.`);
    }

    // Jika ada error validasi, tolak request dengan 422 Unprocessable Entity
    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Data yang dikirim tidak valid.',
            errors: errors
        });
    }
    // ── AKHIR VALIDASI ──────────────────────────────────────────────

    try {
        // 1. Cek apakah email sudah terdaftar sebelumnya
        const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
        const existingUser = await pool.query(checkEmailQuery, [email.trim().toLowerCase()]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
        }

        // 2. Buat UUID baru secara otomatis
        const newUserId = crypto.randomUUID();
        const userRole = role || 'affiliate';

        // 3. Hash Password & Masukkan data user baru ke database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertQuery = `
            INSERT INTO users (id, first_name, last_name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role
        `;
        const newUser = await pool.query(insertQuery, [
            newUserId,
            firstName.trim(),
            lastName.trim(),
            email.trim().toLowerCase(),
            hashedPassword,
            userRole
        ]);

        // 4. Jika role affiliate, otomatis buat record di tabel affiliates & wallets
        if (userRole === 'affiliate') {
            const affiliateId = crypto.randomUUID();
            const referralCode = generateReferralCode(firstName);
            const FRONTEND_URL = process.env.FRONTEND_URL || 'https://comis-io-kelompok-5.vercel.app';
            const referralLink = `${FRONTEND_URL}/ref/${referralCode}`;

            await pool.query(
                `INSERT INTO affiliates (id, user_id, referral_code, referral_link, status) 
                 VALUES ($1, $2, $3, $4, 'active')`,
                [affiliateId, newUserId, referralCode, referralLink]
            );

            // Buat wallet untuk affiliate
            const walletId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO wallets (id, affiliate_id, balance) VALUES ($1, $2, 0)`,
                [walletId, affiliateId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil!',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('Error saat sign up:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat registrasi' });
    }
});

// ==========================================
// ENDPOINT LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = `
            SELECT u.id, u.first_name, u.last_name, u.role, u.password_hash,
                   a.id as affiliate_id, a.referral_code, a.status as affiliate_status
            FROM users u
            LEFT JOIN affiliates a ON a.user_id = u.id
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                res.json({
                    success: true,
                    message: 'Login Berhasil',
                    user: {
                        id: user.id,
                        name: user.first_name,
                        lastName: user.last_name,
                        role: user.role,
                        affiliateId: user.affiliate_id,
                        referralCode: user.referral_code
                    }
                });
            } else {
                res.status(401).json({ success: false, message: 'Password salah' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Email tidak terdaftar' });
        }
    } catch (err) {
        console.error('Error saat login:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET semua produk
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.json({ success: true, products: result.rows });
    } catch (err) {
        console.error('Error get products:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
    }
});

// POST tambah produk baru (Admin)
app.post('/api/products', async (req, res) => {
    const { name, price, category, image_url, description, commission_rate } = req.body;
    try {
        const id = crypto.randomUUID();
        const result = await pool.query(
            `INSERT INTO products (id, name, price, category, image_url, description, commission_rate) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, name, price, category, image_url || '', description || '', commission_rate || 10]
        );
        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error('Error add product:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah produk' });
    }
});

// PUT update produk (Admin)
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, category, image_url, description, commission_rate } = req.body;
    try {
        const result = await pool.query(
            `UPDATE products SET name=$1, price=$2, category=$3, image_url=$4, description=$5, commission_rate=$6 
             WHERE id=$7 RETURNING *`,
            [name, price, category, image_url || '', description || '', commission_rate || 10, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }
        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error('Error update product:', err);
        res.status(500).json({ success: false, message: 'Gagal update produk' });
    }
});

// DELETE produk (Admin)
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id=$1', [id]);
        res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (err) {
        console.error('Error delete product:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
    }
});

// ==========================================
// ADD CAMPAIGN (ENDPOINT UNTUK TESTING)
// ==========================================
app.post('/api/campaigns', async (req, res) => {
    const { campaignName, productUrl, commissionRate } = req.body;

    // ── VALIDASI INPUT ──────────────────────────────────────────────
    const errors = [];

    if (!campaignName || campaignName.trim().length === 0) {
        errors.push('Nama campaign tidak boleh kosong.');
    } else if (campaignName.trim().length < 5) {
        errors.push('Nama campaign minimal 5 karakter.');
    }

    if (!productUrl || productUrl.trim().length === 0) {
        errors.push('URL Produk tidak boleh kosong.');
    } else if (!productUrl.includes('http') && !productUrl.includes('www')) {
        errors.push('Format URL tidak valid.');
    }

    if (commissionRate === undefined || commissionRate === null) {
        errors.push('Commission rate tidak boleh kosong.');
    } else if (isNaN(commissionRate) || commissionRate < 1 || commissionRate > 100) {
        errors.push('Commission rate harus berupa angka antara 1 hingga 100.');
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Gagal menambahkan campaign. Periksa kembali form anda.',
            errors: errors
        });
    }
    // ── AKHIR VALIDASI ──────────────────────────────────────────────

    try {
        // Karena di skema tidak ada tabel khusus 'campaigns', kita simpan sebagai 'products'
        const id = crypto.randomUUID();
        const result = await pool.query(
            `INSERT INTO products (id, name, price, category, image_url, description, commission_rate) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, campaignName, 0, 'Campaign', productUrl, 'Promotional Campaign', commissionRate]
        );
        res.status(201).json({ success: true, message: 'Campaign berhasil ditambahkan!', campaign: result.rows[0] });
    } catch (err) {
        console.error('Error add campaign:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan di server' });
    }
});

// ==========================================
// CAMPAIGNS (AFFILIATE JOIN PRODUCT)
// ==========================================

// POST join campaign - Affiliator join campaign dan dapat referral code
app.post('/api/campaigns/join', async (req, res) => {
    const { affiliate_id, product_id, affiliate_name } = req.body;
    try {
        // Cek apakah sudah join
        const existing = await pool.query(
            `SELECT * FROM affiliate_campaigns WHERE affiliate_id=$1 AND product_id=$2`,
            [affiliate_id, product_id]
        );
        if (existing.rows.length > 0) {
            return res.json({
                success: true,
                message: 'Anda sudah bergabung di campaign ini',
                campaign: existing.rows[0],
                alreadyJoined: true
            });
        }

        // Generate unique referral code untuk campaign ini
        const referralCode = generateReferralCode(affiliate_name || 'AFF');
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://comis-io-kelompok-5.vercel.app';
        const referralLink = `${FRONTEND_URL}/buy/${referralCode}`;
        const campaignId = crypto.randomUUID();

        await pool.query(
            `INSERT INTO affiliate_campaigns (id, affiliate_id, product_id, referral_code, referral_link, joined_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [campaignId, affiliate_id, product_id, referralCode, referralLink]
        );

        res.status(201).json({
            success: true,
            message: 'Berhasil bergabung campaign!',
            campaign: {
                id: campaignId,
                affiliate_id,
                product_id,
                referral_code: referralCode,
                referral_link: referralLink
            }
        });
    } catch (err) {
        console.error('Error join campaign:', err);
        res.status(500).json({ success: false, message: 'Gagal bergabung campaign' });
    }
});

// GET campaigns yang sudah di-join affiliator
app.get('/api/campaigns/:affiliateId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ac.*, p.name as product_name, p.price, p.category, p.image_url, p.commission_rate
             FROM affiliate_campaigns ac
             JOIN products p ON p.id = ac.product_id
             WHERE ac.affiliate_id = $1
             ORDER BY ac.joined_at DESC`,
            [req.params.affiliateId]
        );
        res.json({ success: true, campaigns: result.rows });
    } catch (err) {
        console.error('Error get campaigns:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data campaign' });
    }
});

// ==========================================
// COMMISSIONS
// ==========================================

// GET komisi affiliator
app.get('/api/commissions/:affiliateId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, t.order_reference, t.order_amount 
             FROM commissions c
             LEFT JOIN transactions t ON t.id = c.transaction_id
             WHERE c.affiliate_id = $1
             ORDER BY c.created_at DESC`,
            [req.params.affiliateId]
        );
        res.json({ success: true, commissions: result.rows });
    } catch (err) {
        console.error('Error get commissions:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data komisi' });
    }
});

// GET semua commission schemes (Admin)
app.get('/api/commission-schemes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM commission_schemes ORDER BY name ASC');
        res.json({ success: true, schemes: result.rows });
    } catch (err) {
        console.error('Error get schemes:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil skema komisi' });
    }
});

// POST buat commission scheme (Admin)
app.post('/api/commission-schemes', async (req, res) => {
    const { name, type, value, is_active } = req.body;
    try {
        const id = crypto.randomUUID();
        const result = await pool.query(
            `INSERT INTO commission_schemes (id, name, type, value, is_active) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, name, type, value, is_active !== false]
        );
        res.status(201).json({ success: true, scheme: result.rows[0] });
    } catch (err) {
        console.error('Error add scheme:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah skema komisi' });
    }
});

// PUT update commission scheme (Admin)
app.put('/api/commission-schemes/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, value, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE commission_schemes SET name=$1, type=$2, value=$3, is_active=$4 WHERE id=$5 RETURNING *`,
            [name, type, value, is_active, id]
        );
        res.json({ success: true, scheme: result.rows[0] });
    } catch (err) {
        console.error('Error update scheme:', err);
        res.status(500).json({ success: false, message: 'Gagal update skema komisi' });
    }
});

// DELETE commission scheme
app.delete('/api/commission-schemes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM commission_schemes WHERE id=$1', [id]);
        res.json({ success: true, message: 'Skema komisi berhasil dihapus' });
    } catch (err) {
        console.error('Error delete scheme:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus skema komisi' });
    }
});

// ==========================================
// WALLETS
// ==========================================

// GET wallet affiliator
app.get('/api/wallets/:affiliateId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM wallets WHERE affiliate_id = $1`,
            [req.params.affiliateId]
        );
        if (result.rows.length === 0) {
            return res.json({ success: true, wallet: { balance: 0 } });
        }
        res.json({ success: true, wallet: result.rows[0] });
    } catch (err) {
        console.error('Error get wallet:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data wallet' });
    }
});

// ==========================================
// PAYOUT REQUESTS
// ==========================================

// GET semua payout requests (Admin)
app.get('/api/payouts', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.*, u.first_name, u.last_name, u.email
             FROM payout_requests pr
             LEFT JOIN affiliates a ON a.id = pr.affiliate_id
             LEFT JOIN users u ON u.id = a.user_id
             ORDER BY pr.created_at DESC`
        );
        res.json({ success: true, payouts: result.rows });
    } catch (err) {
        console.error('Error get payouts:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data payout' });
    }
});

// GET payout requests affiliator tertentu
app.get('/api/payouts/affiliate/:affiliateId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM payout_requests WHERE affiliate_id = $1 ORDER BY created_at DESC`,
            [req.params.affiliateId]
        );
        res.json({ success: true, payouts: result.rows });
    } catch (err) {
        console.error('Error get affiliate payouts:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data payout' });
    }
});

// POST request payout (Affiliator)
app.post('/api/payouts/request', async (req, res) => {
    const { affiliate_id, amount, bank_name, account_number, account_holder } = req.body;

    // ── VALIDASI INPUT ──────────────────────────────────────────────
    const errors = [];

    if (!affiliate_id) {
        errors.push('ID Affiliate tidak valid atau tidak ditemukan.');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        errors.push('Nominal penarikan harus berupa angka lebih besar dari 0.');
    } else if (amount < 50000) {
        errors.push('Minimum penarikan adalah Rp 50.000.');
    }

    if (!bank_name || bank_name.trim().length === 0) {
        errors.push('Nama Bank tidak boleh kosong.');
    }

    if (!account_number || account_number.trim().length === 0) {
        errors.push('Nomor Rekening tidak boleh kosong.');
    } else if (!/^[0-9]+$/.test(account_number)) {
        errors.push('Nomor Rekening hanya boleh berisi angka.');
    }

    if (!account_holder || account_holder.trim().length === 0) {
        errors.push('Nama Pemilik Rekening tidak boleh kosong.');
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Pengajuan penarikan dana ditolak.',
            errors: errors
        });
    }
    // ── AKHIR VALIDASI ──────────────────────────────────────────────

    try {
        // Cek saldo wallet pastikan mencukupi
        const wallet = await pool.query('SELECT balance FROM wallets WHERE affiliate_id = $1', [affiliate_id]);
        if (wallet.rows.length === 0 || parseFloat(wallet.rows[0].balance) < amount) {
            return res.status(422).json({
                success: false,
                message: 'Pengajuan penarikan dana ditolak.',
                errors: ['Saldo Anda tidak mencukupi untuk melakukan penarikan sebesar nominal tersebut.']
            });
        }

        const id = crypto.randomUUID();
        await pool.query(
            `INSERT INTO payout_requests (id, affiliate_id, amount, bank_name, account_number, account_holder, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
            [id, affiliate_id, amount, bank_name, account_number, account_holder]
        );
        res.status(201).json({ success: true, message: 'Payout request berhasil diajukan' });
    } catch (err) {
        console.error('Error request payout:', err);
        res.status(500).json({ success: false, message: 'Gagal mengajukan payout' });
    }
});

// PUT approve payout (Admin)
app.put('/api/payouts/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            `UPDATE payout_requests SET status='approved', updated_at=NOW() WHERE id=$1`,
            [id]
        );

        // Record to payout history
        const payout = await pool.query('SELECT * FROM payout_requests WHERE id=$1', [id]);
        if (payout.rows.length > 0) {
            const p = payout.rows[0];
            const historyId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO payout_history (id, payout_request_id, status_from, status_to, note, created_at)
                 VALUES ($1, $2, 'pending', 'approved', 'Approved by admin', NOW())`,
                [historyId, id]
            );

            // Kurangi saldo wallet
            await pool.query(
                `UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE affiliate_id = $2`,
                [p.amount, p.affiliate_id]
            );

            // Generate Notifikasi Payout Berhasil ke user bersangkutan
            const affiliateRes = await pool.query('SELECT user_id FROM affiliates WHERE id=$1', [p.affiliate_id]);
            if (affiliateRes.rows.length > 0) {
                const userId = affiliateRes.rows[0].user_id;
                const notifId = crypto.randomUUID();
                await pool.query(
                    `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
                     VALUES ($1, $2, $3, $4, $5, false, NOW())`,
                    [notifId, userId, 'Pencairan Dana Berhasil', `Pengajuan payout sebesar Rp${parseFloat(p.amount).toLocaleString('id-ID')} ke rekening ${p.bank_name} Anda telah disetujui.`, 'payout_success']
                );
            }
        }

        res.json({ success: true, message: 'Payout berhasil di-approve' });
    } catch (err) {
        console.error('Error approve payout:', err);
        res.status(500).json({ success: false, message: 'Gagal approve payout' });
    }
});

// PUT reject payout (Admin)
app.put('/api/payouts/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            `UPDATE payout_requests SET status='rejected', updated_at=NOW() WHERE id=$1`,
            [id]
        );

        const historyId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO payout_history (id, payout_request_id, status_from, status_to, note, created_at)
             VALUES ($1, $2, 'pending', 'rejected', 'Rejected by admin', NOW())`,
            [historyId, id]
        );

        res.json({ success: true, message: 'Payout ditolak' });
    } catch (err) {
        console.error('Error reject payout:', err);
        res.status(500).json({ success: false, message: 'Gagal reject payout' });
    }
});

// ==========================================
// DASHBOARD STATS
// ==========================================

// Admin Dashboard Stats
app.get('/api/dashboard/admin', async (req, res) => {
    try {
        const totalAffiliates = await pool.query('SELECT COUNT(*) FROM affiliates');
        const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
        const pendingPayouts = await pool.query("SELECT COUNT(*) FROM payout_requests WHERE status='pending'");
        const totalRevenue = await pool.query('SELECT COALESCE(SUM(order_amount), 0) as total FROM transactions');
        const totalCommissions = await pool.query('SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions');

        res.json({
            success: true,
            stats: {
                totalAffiliates: parseInt(totalAffiliates.rows[0].count),
                totalProducts: parseInt(totalProducts.rows[0].count),
                pendingPayouts: parseInt(pendingPayouts.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].total),
                totalCommissions: parseFloat(totalCommissions.rows[0].total)
            }
        });
    } catch (err) {
        console.error('Error admin stats:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil stats admin' });
    }
});

// Affiliate Dashboard Stats
app.get('/api/dashboard/affiliate/:affiliateId', async (req, res) => {
    const { affiliateId } = req.params;
    try {
        const wallet = await pool.query('SELECT COALESCE(balance, 0) as balance FROM wallets WHERE affiliate_id=$1', [affiliateId]);
        const pendingComm = await pool.query("SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions WHERE affiliate_id=$1 AND status='pending'", [affiliateId]);
        const pendingCommCount = await pool.query("SELECT COUNT(*) FROM commissions WHERE affiliate_id=$1 AND status='pending'", [affiliateId]);
        const totalClicks = await pool.query('SELECT COUNT(*) FROM referral_clicks WHERE affiliate_id=$1', [affiliateId]);
        const totalSales = await pool.query("SELECT COUNT(*) FROM transactions WHERE affiliate_id=$1 AND status='completed'", [affiliateId]);
        const campaigns = await pool.query('SELECT COUNT(*) FROM affiliate_campaigns WHERE affiliate_id=$1', [affiliateId]);

        res.json({
            success: true,
            stats: {
                walletBalance: wallet.rows.length > 0 ? parseFloat(wallet.rows[0].balance) : 0,
                pendingCommissions: parseFloat(pendingComm.rows[0].total),
                pendingOrdersCount: parseInt(pendingCommCount.rows[0].count),
                totalClicks: parseInt(totalClicks.rows[0].count),
                totalSales: parseInt(totalSales.rows[0].count),
                activeCampaigns: parseInt(campaigns.rows[0].count)
            }
        });
    } catch (err) {
        console.error('Error affiliate stats:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil stats affiliate' });
    }
});

// ==========================================
// NOTIFICATIONS
// ==========================================
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
            [req.params.userId]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (err) {
        console.error('Error get notifications:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi' });
    }
});

app.post('/api/notifications', async (req, res) => {
    const { user_id, title, message, type } = req.body;
    try {
        // If user_id is empty string from Postman, convert it to null to avoid UUID error
        const validUserId = user_id && user_id.trim() !== '' ? user_id : null;
        const notifId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, false, NOW())`,
            [notifId, validUserId, title || 'System Notification', message || 'New notification received.', type || 'info']
        );
        res.status(201).json({ success: true, message: 'Notifikasi berhasil ditambahkan', notification_id: notifId });
    } catch (err) {
        console.error('Error add notification:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah notifikasi' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
        res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
    } catch (err) {
        console.error('Error read notification:', err);
        res.status(500).json({ success: false, message: 'Gagal update notifikasi' });
    }
});

// ==========================================
// LEADERBOARD
// ==========================================
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id as affiliate_id, u.first_name, u.last_name, 
                    (SELECT COUNT(*) FROM transactions t WHERE t.affiliate_id = a.id AND t.status='completed') as total_sales,
                    COALESCE(w.balance, 0) as balance
             FROM affiliates a
             JOIN users u ON u.id = a.user_id
             LEFT JOIN wallets w ON w.affiliate_id = a.id
             ORDER BY total_sales DESC, balance DESC
             LIMIT 10`
        );

        const formattedLeaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            first_name: row.first_name,
            last_name: row.last_name,
            sold: `${row.total_sales || 0} products sold`
        }));

        res.json({ success: true, leaderboard: formattedLeaderboard });
    } catch (err) {
        console.error('Error get leaderboard:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil leaderboard' });
    }
});

// ==========================================
// REFERRAL CLICKS TRACKING
// ==========================================
app.post('/api/referral-click', async (req, res) => {
    const { referral_code, ip_address, user_agent } = req.body;
    try {
        // Find affiliate by referral code
        const affiliate = await pool.query(
            `SELECT ac.affiliate_id FROM affiliate_campaigns ac WHERE ac.referral_code = $1`,
            [referral_code]
        );

        if (affiliate.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Referral code tidak valid' });
        }

        const clickId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO referral_clicks (id, affiliate_id, ip_address, user_agent, clicked_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [clickId, affiliate.rows[0].affiliate_id, ip_address || '', user_agent || '']
        );

        res.json({ success: true, message: 'Click recorded' });
    } catch (err) {
        console.error('Error record click:', err);
        res.status(500).json({ success: false, message: 'Gagal record click' });
    }
});

// ==========================================
// SEED PRODUCTS (30+ Produk)
// ==========================================
app.post('/api/seed-products', async (req, res) => {
    const products = [
        // Fashion
        { name: 'Red Puma Shoes', price: 1250000, category: 'Fashion', image_url: '👟', description: 'Sepatu olahraga Puma warna merah', commission_rate: 12 },
        { name: 'Blue Denim Jacket', price: 850000, category: 'Fashion', image_url: '🧥', description: 'Jaket denim biru klasik', commission_rate: 10 },
        { name: 'NY Yankees Cap', price: 350000, category: 'Fashion', image_url: '🧢', description: 'Topi NY Yankees hitam original', commission_rate: 8 },
        { name: 'White Sneakers Pro', price: 1450000, category: 'Fashion', image_url: '👟', description: 'Sneakers putih premium', commission_rate: 12 },
        { name: 'Leather Belt Classic', price: 450000, category: 'Fashion', image_url: '👔', description: 'Ikat pinggang kulit asli', commission_rate: 15 },
        { name: 'Casual Polo Shirt', price: 299000, category: 'Fashion', image_url: '👕', description: 'Kaos polo kasual premium', commission_rate: 10 },
        { name: 'Running Shorts', price: 199000, category: 'Fashion', image_url: '🩳', description: 'Celana pendek lari breathable', commission_rate: 8 },
        { name: 'Aviator Sunglasses', price: 750000, category: 'Fashion', image_url: '🕶️', description: 'Kacamata aviator polarized', commission_rate: 15 },

        // Electronics
        { name: 'Wireless Earbuds Pro', price: 1299000, category: 'Electronics', image_url: '🎧', description: 'Earbuds wireless noise cancelling', commission_rate: 8 },
        { name: 'Smart Watch X5', price: 2450000, category: 'Electronics', image_url: '⌚', description: 'Smartwatch fitness tracking', commission_rate: 7 },
        { name: 'Bluetooth Speaker', price: 899000, category: 'Electronics', image_url: '🔊', description: 'Speaker bluetooth portable', commission_rate: 10 },
        { name: 'USB-C Hub 7-in-1', price: 550000, category: 'Electronics', image_url: '🔌', description: 'USB Hub multi-port', commission_rate: 12 },
        { name: 'Mechanical Keyboard', price: 1150000, category: 'Electronics', image_url: '⌨️', description: 'Keyboard mekanikal RGB', commission_rate: 10 },
        { name: 'Gaming Mouse', price: 650000, category: 'Electronics', image_url: '🖱️', description: 'Mouse gaming 16000 DPI', commission_rate: 10 },
        { name: 'Webcam HD 1080p', price: 799000, category: 'Electronics', image_url: '📷', description: 'Webcam full HD autofocus', commission_rate: 8 },
        { name: 'Power Bank 20000mAh', price: 399000, category: 'Electronics', image_url: '🔋', description: 'Power bank fast charging', commission_rate: 12 },

        // Health & Beauty
        { name: 'Vitamin C Serum', price: 185000, category: 'Health & Beauty', image_url: '💧', description: 'Serum vitamin C brightening', commission_rate: 20 },
        { name: 'Facial Moisturizer', price: 225000, category: 'Health & Beauty', image_url: '🧴', description: 'Moisturizer untuk semua kulit', commission_rate: 18 },
        { name: 'Hair Growth Oil', price: 165000, category: 'Health & Beauty', image_url: '💆', description: 'Minyak pertumbuhan rambut', commission_rate: 22 },
        { name: 'Sunscreen SPF50', price: 145000, category: 'Health & Beauty', image_url: '☀️', description: 'Sunscreen SPF50 anti UV', commission_rate: 18 },
        { name: 'Protein Shake Mix', price: 450000, category: 'Health & Beauty', image_url: '🥤', description: 'Shake protein whey premium', commission_rate: 15 },
        { name: 'Essential Oil Set', price: 320000, category: 'Health & Beauty', image_url: '🌿', description: 'Set minyak esensial aromaterapi', commission_rate: 20 },

        // Home & Living
        { name: 'LED Desk Lamp', price: 350000, category: 'Home & Living', image_url: '💡', description: 'Lampu meja LED adjustable', commission_rate: 12 },
        { name: 'Memory Foam Pillow', price: 280000, category: 'Home & Living', image_url: '🛏️', description: 'Bantal memory foam orthopedic', commission_rate: 15 },
        { name: 'Coffee Maker Portable', price: 550000, category: 'Home & Living', image_url: '☕', description: 'Pembuat kopi portable', commission_rate: 10 },
        { name: 'Plant Pot Ceramic', price: 125000, category: 'Home & Living', image_url: '🪴', description: 'Pot tanaman keramik minimalis', commission_rate: 18 },
        { name: 'Aroma Diffuser', price: 285000, category: 'Home & Living', image_url: '🌫️', description: 'Diffuser aroma ultrasonic', commission_rate: 15 },
        { name: 'Kitchen Scale Digital', price: 175000, category: 'Home & Living', image_url: '⚖️', description: 'Timbangan dapur digital presisi', commission_rate: 12 },

        // Sports & Outdoor
        { name: 'Yoga Mat Premium', price: 350000, category: 'Sports & Outdoor', image_url: '🧘', description: 'Matras yoga anti slip', commission_rate: 12 },
        { name: 'Resistance Band Set', price: 199000, category: 'Sports & Outdoor', image_url: '💪', description: 'Set band resistensi 5 level', commission_rate: 15 },
        { name: 'Water Bottle 1L', price: 125000, category: 'Sports & Outdoor', image_url: '🥤', description: 'Botol minum stainless 1 liter', commission_rate: 10 },
        { name: 'Camping Flashlight', price: 225000, category: 'Sports & Outdoor', image_url: '🔦', description: 'Senter camping super terang', commission_rate: 12 },
        { name: 'Fitness Tracker Band', price: 450000, category: 'Sports & Outdoor', image_url: '📿', description: 'Gelang fitness tracker', commission_rate: 10 },
        { name: 'Jump Rope Speed', price: 85000, category: 'Sports & Outdoor', image_url: '🏋️', description: 'Tali skipping speed rope', commission_rate: 18 },
    ];

    try {
        let inserted = 0;
        for (const p of products) {
            const id = crypto.randomUUID();
            // Check if product already exists
            const existing = await pool.query('SELECT id FROM products WHERE name=$1', [p.name]);
            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO products (id, name, price, category, image_url, description, commission_rate) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [id, p.name, p.price, p.category, p.image_url, p.description, p.commission_rate]
                );
                inserted++;
            }
        }
        res.json({ success: true, message: `${inserted} produk baru berhasil ditambahkan`, total: products.length });
    } catch (err) {
        console.error('Error seed products:', err);
        res.status(500).json({ success: false, message: 'Gagal seed produk' });
    }
});

// ==========================================
// DATABASE MIGRATION - Create missing tables
// ==========================================
app.post('/api/migrate', async (req, res) => {
    try {
        // Create affiliate_campaigns table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS affiliate_campaigns (
                id UUID PRIMARY KEY,
                affiliate_id UUID REFERENCES affiliates(id),
                product_id UUID REFERENCES products(id),
                referral_code VARCHAR(20) UNIQUE NOT NULL,
                referral_link VARCHAR(255),
                joined_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Ensure products table has all needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT '';
                ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
                ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10;
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure payout_requests has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
                ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure commissions has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE commissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
                ALTER TABLE commissions ADD COLUMN IF NOT EXISTS transaction_id UUID;
                ALTER TABLE commissions ADD COLUMN IF NOT EXISTS affiliate_id UUID;
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure referral_clicks has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS affiliate_id UUID;
                ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50) DEFAULT '';
                ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT '';
                ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Create or Update notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY,
                user_id UUID,
                title VARCHAR(255),
                message TEXT,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure payout_history has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE payout_history ADD COLUMN IF NOT EXISTS payout_request_id UUID;
                ALTER TABLE payout_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure transactions has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE transactions ADD COLUMN IF NOT EXISTS affiliate_id UUID;
                ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure leaderboard has needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS affiliate_id UUID;
                ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS rank INTEGER;
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure wallets has updated_at
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Create customers table (untuk pembeli via referral link)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Ensure customers has all needed columns
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
                ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
                ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        // Ensure transactions has customer_id column
        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_id UUID;
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);

        res.json({ success: true, message: 'Migrasi database berhasil!' });
    } catch (err) {
        console.error('Error migration:', err);
        res.status(500).json({ success: false, message: 'Gagal migrasi: ' + err.message });
    }
});

// ==========================================
// GET all affiliates (Admin)
// ==========================================
app.get('/api/affiliates', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.first_name, u.last_name, u.email, w.balance as wallet_balance
             FROM affiliates a
             JOIN users u ON u.id = a.user_id
             LEFT JOIN wallets w ON w.affiliate_id = a.id
             ORDER BY u.first_name ASC`
        );
        res.json({ success: true, affiliates: result.rows });
    } catch (err) {
        console.error('Error get affiliates:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data affiliates' });
    }
});

// PUT update affiliate status (Admin)
app.put('/api/affiliates/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE affiliates SET status=$1 WHERE id=$2 RETURNING *`,
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Affiliate tidak ditemukan' });
        }
        res.json({ success: true, affiliate: result.rows[0] });
    } catch (err) {
        console.error('Error update affiliate status:', err);
        res.status(500).json({ success: false, message: 'Gagal update status affiliate' });
    }
});

// ==========================================
// SEED ADMIN ACCOUNT
// ==========================================
app.post('/api/seed-admin', async (req, res) => {
    try {
        // Cek apakah admin sudah ada
        const existing = await pool.query("SELECT id FROM users WHERE email='admin@comisio.com'");
        if (existing.rows.length > 0) {
            return res.json({ success: true, message: 'Admin account sudah ada', alreadyExists: true });
        }

        const adminId = crypto.randomUUID();
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (id, first_name, last_name, email, password_hash, role) 
             VALUES ($1, 'Admin', 'Comisio', 'admin@comisio.com', $2, 'admin')`,
            [adminId, hashedAdminPassword]
        );

        res.json({ success: true, message: 'Admin account berhasil dibuat! Email: admin@comisio.com, Password: admin123' });
    } catch (err) {
        console.error('Error seed admin:', err);
        res.status(500).json({ success: false, message: 'Gagal membuat admin account' });
    }
});

// Auto-seed admin on startup
async function autoSeedAdmin() {
    try {
        const existing = await pool.query("SELECT id FROM users WHERE email='admin@comisio.com'");
        if (existing.rows.length === 0) {
            const adminId = crypto.randomUUID();
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                `INSERT INTO users (id, first_name, last_name, email, password_hash, role) 
                 VALUES ($1, 'Admin', 'Comisio', 'admin@comisio.com', $2, 'admin')`,
                [adminId, hashedAdminPassword]
            );
            console.log('✅ Admin account berhasil di-seed: admin@comisio.com / admin123');
        } else {
            console.log('ℹ️ Admin account sudah ada');
        }
    } catch (err) {
        console.error('⚠️ Gagal auto-seed admin:', err.message);
    }
}

// ==========================================
// BUYER / CHECKOUT ENDPOINTS
// ==========================================

// GET info produk via referral link (untuk halaman checkout pembeli)
app.get('/api/buy/:referralCode', async (req, res) => {
    const { referralCode } = req.params;
    try {
        // Cari campaign berdasarkan referral_code
        const campaignResult = await pool.query(
            `SELECT ac.id as campaign_id, ac.affiliate_id, ac.referral_code, ac.referral_link,
                    p.id as product_id, p.name, p.price, p.description, p.image_url, p.category, p.commission_rate,
                    u.first_name as affiliate_first_name, u.last_name as affiliate_last_name
             FROM affiliate_campaigns ac
             JOIN products p ON p.id = ac.product_id
             JOIN affiliates a ON a.id = ac.affiliate_id
             JOIN users u ON u.id = a.user_id
             WHERE ac.referral_code = $1`,
            [referralCode]
        );

        if (campaignResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Link referral tidak valid atau sudah kadaluarsa.' });
        }

        const campaign = campaignResult.rows[0];

        // Catat referral click
        try {
            const clickId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO referral_clicks (id, affiliate_id, ip_address, user_agent, clicked_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [clickId, campaign.affiliate_id, req.ip || '', req.headers['user-agent'] || '']
            );
        } catch (clickErr) {
            // Non-fatal: log but don't fail
            console.warn('Warning: gagal catat referral click:', clickErr.message);
        }

        res.json({
            success: true,
            product: {
                id: campaign.product_id,
                name: campaign.name,
                price: parseFloat(campaign.price),
                description: campaign.description,
                image_url: campaign.image_url,
                category: campaign.category,
                commission_rate: parseFloat(campaign.commission_rate || 10)
            },
            campaign: {
                id: campaign.campaign_id,
                referral_code: campaign.referral_code,
                affiliate_id: campaign.affiliate_id,
                affiliate_name: `${campaign.affiliate_first_name} ${campaign.affiliate_last_name}`.trim()
            }
        });
    } catch (err) {
        console.error('Error get buy info:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});

// POST checkout - pembeli melakukan pemesanan
app.post('/api/checkout', async (req, res) => {
    const { 
        referral_code, 
        customer_name, 
        customer_email, 
        customer_phone, 
        customer_address,
        product_id,
        affiliate_id
    } = req.body;

    // Validasi input
    const errors = [];
    if (!customer_name || customer_name.trim().length < 2) errors.push('Nama lengkap minimal 2 karakter.');
    if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) errors.push('Format email tidak valid.');
    if (!customer_phone || !/^[0-9+\-\s]{8,15}$/.test(customer_phone.trim())) errors.push('Nomor telepon tidak valid (8-15 digit).');
    if (!customer_address || customer_address.trim().length < 5) errors.push('Alamat minimal 5 karakter.');
    if (!referral_code) errors.push('Referral code tidak valid.');

    if (errors.length > 0) {
        return res.status(422).json({ success: false, message: 'Data tidak valid.', errors });
    }

    try {
        // 1. Ambil data campaign + produk berdasarkan referral_code
        const campaignRes = await pool.query(
            `SELECT ac.id as campaign_id, ac.affiliate_id,
                    p.id as product_id, p.name, p.price, p.commission_rate
             FROM affiliate_campaigns ac
             JOIN products p ON p.id = ac.product_id
             WHERE ac.referral_code = $1`,
            [referral_code]
        );

        if (campaignRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Referral code tidak valid.' });
        }

        const campaign = campaignRes.rows[0];
        const productPrice = parseFloat(campaign.price);
        const commissionRate = parseFloat(campaign.commission_rate || 10);
        const commissionAmount = (productPrice * commissionRate) / 100;
        const orderRef = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // 2. Simpan atau update customer
        let customerId;
        const existingCustomer = await pool.query(
            `SELECT id FROM customers WHERE email = $1`,
            [customer_email.trim().toLowerCase()]
        );

        if (existingCustomer.rows.length > 0) {
            customerId = existingCustomer.rows[0].id;
            // Update info terbaru customer
            await pool.query(
                `UPDATE customers SET name=$1, phone=$2, address=$3 WHERE id=$4`,
                [customer_name.trim(), customer_phone.trim(), customer_address.trim(), customerId]
            );
        } else {
            customerId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO customers (id, name, email, phone, address, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [customerId, customer_name.trim(), customer_email.trim().toLowerCase(), customer_phone.trim(), customer_address.trim()]
            );
        }

        // 3. Buat transaksi
        const transactionId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO transactions (id, customer_id, affiliate_id, order_reference, order_amount, status, created_at)
             VALUES ($1, $2, $3, $4, $5, 'completed', NOW())`,
            [transactionId, customerId, campaign.affiliate_id, orderRef, productPrice]
        );

        // 4. Buat record komisi
        const commissionId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO commissions (id, affiliate_id, transaction_id, commission_amount, status, created_at)
             VALUES ($1, $2, $3, $4, 'approved', NOW())`,
            [commissionId, campaign.affiliate_id, transactionId, commissionAmount]
        );

        // 5. Tambahkan komisi langsung ke wallet affiliator
        const walletExists = await pool.query(
            `SELECT id FROM wallets WHERE affiliate_id = $1`,
            [campaign.affiliate_id]
        );

        if (walletExists.rows.length > 0) {
            await pool.query(
                `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE affiliate_id = $2`,
                [commissionAmount, campaign.affiliate_id]
            );
        } else {
            // Buat wallet baru jika belum ada
            const walletId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO wallets (id, affiliate_id, balance) VALUES ($1, $2, $3)`,
                [walletId, campaign.affiliate_id, commissionAmount]
            );
        }

        // 6. Kirim notifikasi ke affiliator
        try {
            const affiliateRes = await pool.query(
                `SELECT user_id FROM affiliates WHERE id = $1`,
                [campaign.affiliate_id]
            );
            if (affiliateRes.rows.length > 0) {
                const notifId = crypto.randomUUID();
                await pool.query(
                    `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
                     VALUES ($1, $2, $3, $4, $5, false, NOW())`,
                    [
                        notifId,
                        affiliateRes.rows[0].user_id,
                        '🎉 Penjualan Baru!',
                        `${customer_name} baru saja membeli "${campaign.name}" via link Anda. Komisi Rp${commissionAmount.toLocaleString('id-ID')} telah masuk ke wallet Anda.`,
                        'new_sale'
                    ]
                );
            }
        } catch (notifErr) {
            console.warn('Warning: gagal kirim notifikasi:', notifErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Pemesanan berhasil! Terima kasih telah berbelanja.',
            order: {
                order_reference: orderRef,
                product_name: campaign.name,
                amount: productPrice,
                customer_name: customer_name.trim(),
                customer_email: customer_email.trim().toLowerCase()
            }
        });

    } catch (err) {
        console.error('Error checkout:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses pemesanan. Silakan coba lagi.' });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 5005;

const server = app.listen(PORT, () => {
    console.log(`✅ Server Backend Comisio berjalan di http://localhost:${PORT}`);
    autoSeedAdmin();
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} sudah digunakan oleh proses lain!`);
        console.error(`📌 Solusi: Jalankan perintah berikut di terminal, lalu coba lagi:`);
        console.error(`   npx kill-port ${PORT}\n`);
        process.exit(1);
    } else {
        console.error(`❌ Server error:`, error);
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.error('🚨 Ada error tersembunyi yang bikin mati:', err);
});
module.exports = app;
