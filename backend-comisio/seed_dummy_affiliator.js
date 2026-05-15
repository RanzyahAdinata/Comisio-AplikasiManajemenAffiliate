const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Konfigurasi koneksi (sama seperti server.js)
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

// ─────────────────────────────────────────────
// DATA DUMMY AFFILIATOR
// ─────────────────────────────────────────────
const dummyAffiliators = [
    {
        firstName: 'Budi',
        lastName: 'Santoso',
        email: 'budi.santoso@gmail.com',
        password: '123456',
        walletBalance: 1000000
    },
    {
        firstName: 'Sari',
        lastName: 'Dewi',
        email: 'sari.dewi@gmail.com',
        password: '123456',
        walletBalance: 1000000
    },
    {
        firstName: 'Andi',
        lastName: 'Pratama',
        email: 'andi.pratama@gmail.com',
        password: '123456',
        walletBalance: 1000000
    }
];

function generateReferralCode(firstName) {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const prefix = (firstName || 'REF').substring(0, 3).toUpperCase();
    return `${prefix}-${random}`;
}

async function seedDummyAffiliators() {
    console.log('🌱 Memulai proses seed data dummy affiliator...\n');

    for (const data of dummyAffiliators) {
        try {
            // 1. Cek apakah email sudah ada
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
            if (existing.rows.length > 0) {
                console.log(`⚠️  Email ${data.email} sudah terdaftar, dilewati.`);
                continue;
            }

            // 2. Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            // 3. Insert ke tabel users
            const userId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO users (id, first_name, last_name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5, 'affiliate')`,
                [userId, data.firstName, data.lastName, data.email, hashedPassword]
            );

            // 4. Insert ke tabel affiliates
            const affiliateId = crypto.randomUUID();
            const referralCode = generateReferralCode(data.firstName);
            const referralLink = `https://comisio.com/ref/${referralCode}`;

            await pool.query(
                `INSERT INTO affiliates (id, user_id, referral_code, referral_link, status)
                 VALUES ($1, $2, $3, $4, 'active')`,
                [affiliateId, userId, referralCode, referralLink]
            );

            // 5. Insert ke tabel wallets dengan saldo Rp 1.000.000
            const walletId = crypto.randomUUID();
            await pool.query(
                `INSERT INTO wallets (id, affiliate_id, balance)
                 VALUES ($1, $2, $3)`,
                [walletId, affiliateId, data.walletBalance]
            );

            console.log(`✅ Berhasil membuat affiliator:`);
            console.log(`   Nama    : ${data.firstName} ${data.lastName}`);
            console.log(`   Email   : ${data.email}`);
            console.log(`   Password: ${data.password}`);
            console.log(`   Saldo   : Rp ${data.walletBalance.toLocaleString('id-ID')}`);
            console.log(`   Referral: ${referralCode}`);
            console.log('');

        } catch (err) {
            console.error(`❌ Gagal membuat affiliator ${data.email}:`, err.message);
        }
    }

    console.log('🎉 Selesai! Data dummy affiliator berhasil dibuat.');
    console.log('\n📋 Ringkasan akun yang bisa digunakan untuk login:');
    console.log('────────────────────────────────────────────────────');
    dummyAffiliators.forEach(d => {
        console.log(`  Email: ${d.email}  |  Password: ${d.password}  |  Saldo: Rp ${d.walletBalance.toLocaleString('id-ID')}`);
    });

    await pool.end();
}

seedDummyAffiliators().catch(err => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
