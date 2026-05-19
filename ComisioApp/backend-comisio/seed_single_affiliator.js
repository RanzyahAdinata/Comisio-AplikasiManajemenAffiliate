const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

async function run() {
    const email    = 'affiliator2test@gmail.com';
    const password = '123456';
    const firstName = 'Affiliator';
    const lastName  = 'Test2';
    const walletBalance = 1000000;

    // Cek apakah email sudah ada
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        console.log('⚠️  Email sudah terdaftar! Tidak ada perubahan.');
        await pool.end();
        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const userId = crypto.randomUUID();
    await pool.query(
        `INSERT INTO users (id, first_name, last_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'affiliate')`,
        [userId, firstName, lastName, email, hashedPassword]
    );

    // Insert affiliate
    const affiliateId = crypto.randomUUID();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referralCode = `AFF-${random}`;
    const referralLink = `https://comisio.com/ref/${referralCode}`;
    await pool.query(
        `INSERT INTO affiliates (id, user_id, referral_code, referral_link, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [affiliateId, userId, referralCode, referralLink]
    );

    // Insert wallet dengan saldo 1.000.000
    const walletId = crypto.randomUUID();
    await pool.query(
        `INSERT INTO wallets (id, affiliate_id, balance) VALUES ($1, $2, $3)`,
        [walletId, affiliateId, walletBalance]
    );

    console.log('✅ Akun berhasil dibuat!');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   Saldo   : Rp 1.000.000');
    console.log('   Referral:', referralCode);

    await pool.end();
}

run().catch(async (err) => {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
});
