// Script untuk fix semua referral link lama di database Supabase
// Jalankan: node fix_referral_links.js

const { Pool } = require('pg');

// Gunakan DATABASE_URL dari environment, atau koneksi Supabase langsung
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Set DATABASE_URL environment variable dulu!');
    console.error('Contoh: $env:DATABASE_URL="postgresql://..." ; node fix_referral_links.js');
    console.error('');
    console.error('DATABASE_URL ada di file .env backend kamu atau di Vercel Environment Variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const FRONTEND_URL = 'https://comis-io-kelompok-5-frontend.vercel.app';

async function fixLinks() {
    try {
        console.log('🔍 Mengecek link yang salah di database...');

        // Cek dulu berapa yang salah
        const check = await pool.query(`
            SELECT id, referral_link FROM affiliate_campaigns 
            WHERE referral_link LIKE '%comisio.com%'
        `);
        console.log(`\n📋 Ditemukan ${check.rows.length} link yang perlu diperbaiki:`);
        check.rows.forEach(r => console.log('  -', r.referral_link));

        if (check.rows.length === 0) {
            console.log('\n✅ Semua link sudah benar! Tidak ada yang perlu diperbaiki.');
        } else {
            // Fix affiliate_campaigns
            const fix1 = await pool.query(`
                UPDATE affiliate_campaigns 
                SET referral_link = REPLACE(referral_link, 'https://comisio.com', $1)
                WHERE referral_link LIKE '%comisio.com%'
                RETURNING id, referral_link
            `, [FRONTEND_URL]);

            console.log(`\n✅ ${fix1.rowCount} link di affiliate_campaigns berhasil diperbaiki:`);
            fix1.rows.forEach(r => console.log('  ✔', r.referral_link));

            // Fix affiliates table
            const fix2 = await pool.query(`
                UPDATE affiliates 
                SET referral_link = REPLACE(referral_link, 'https://comisio.com', $1)
                WHERE referral_link LIKE '%comisio.com%'
                RETURNING id, referral_link
            `, [FRONTEND_URL]);

            if (fix2.rowCount > 0) {
                console.log(`\n✅ ${fix2.rowCount} link di tabel affiliates berhasil diperbaiki:`);
                fix2.rows.forEach(r => console.log('  ✔', r.referral_link));
            }
        }

        console.log('\n🎉 Selesai! Semua link referral sekarang mengarah ke Vercel.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixLinks();
