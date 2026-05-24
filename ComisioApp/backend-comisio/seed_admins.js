require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

const admins = [
    { firstName: 'Admin', lastName: 'Utama', email: 'admin1@gmail.com', password: 'password123' },
    { firstName: 'Admin', lastName: 'Kedua', email: 'admin2@gmail.com', password: 'password123' },
    { firstName: 'Admin', lastName: 'Ketiga', email: 'admin3@gmail.com', password: 'password123' }
];

async function seedAdmins() {
    console.log('Menghubungkan ke database...');
    try {
        for (const admin of admins) {
            // Check if admin exists
            const checkQuery = 'SELECT id FROM users WHERE email = $1';
            const existing = await pool.query(checkQuery, [admin.email]);

            if (existing.rows.length > 0) {
                console.log(`Admin dengan email ${admin.email} sudah ada, melewati...`);
                continue;
            }

            const newUserId = crypto.randomUUID();
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(admin.password, saltRounds);

            const insertQuery = `
                INSERT INTO users (id, first_name, last_name, email, password_hash, role) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await pool.query(insertQuery, [
                newUserId,
                admin.firstName,
                admin.lastName,
                admin.email,
                hashedPassword,
                'admin'
            ]);

            console.log(`Berhasil menambahkan admin: ${admin.email}`);
        }
        console.log('Proses selesai!');
    } catch (err) {
        console.error('Error saat membuat admin:', err);
    } finally {
        pool.end();
    }
}

seedAdmins();
