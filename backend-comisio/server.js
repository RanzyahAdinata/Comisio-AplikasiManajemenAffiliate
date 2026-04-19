const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // Modul bawaan Node.js untuk membuat UUID otomatis

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi Koneksi PostgreSQL
const pool = new Pool({
    user: 'postgres',           // Username default postgres
    host: 'localhost',
    database: 'comisio',        // Nama database kamu
    password: '12345.',         // Sesuai password kamu
    port: 5432,                 // Port default PostgreSQL
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
// ENDPOINT SIGN UP (REGISTRASI USER BARU)
// ==========================================
app.post('/api/signup', async (req, res) => {
    // Menangkap data yang dikirim dari frontend
    const { firstName, lastName, email, password, role } = req.body;

    try {
        // 1. Cek apakah email sudah terdaftar sebelumnya
        const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
        const existingUser = await pool.query(checkEmailQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
        }

        // 2. Buat UUID baru secara otomatis
        const newUserId = crypto.randomUUID();

        // 3. Tentukan role (jika tidak dikirim dari frontend, jadikan 'affiliate' sebagai default)
        const userRole = role || 'affiliate';

        // 4. Masukkan data user baru ke database
        const insertQuery = `
            INSERT INTO users (id, first_name, last_name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, email, role
        `;
        
        const newUser = await pool.query(insertQuery, [newUserId, firstName, lastName, email, password, userRole]);

        // 5. Berikan respon sukses ke frontend
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
        const query = 'SELECT id, first_name, role, password_hash FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Cek kesesuaian password
            if (password === user.password_hash) {
                res.json({
                    success: true,
                    message: 'Login Berhasil',
                    user: {
                        id: user.id, // Mengirimkan UUID
                        name: user.first_name,
                        role: user.role
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

const server = app.listen(5005, () => {
    console.log(`✅ Server Backend Comisio berjalan di http://localhost:5005`);
});

// Alarm 1: Deteksi kalau Port bentrok
server.on('error', (error) => {
    console.error(`❌ GAGAL JALAN: Port 5005 bermasalah atau dipakai aplikasi lain!`, error);
});

// Alarm 2: Mencegah server mati sendiri kalau ada error aneh
process.on('uncaughtException', (err) => {
    console.error('🚨 Ada error tersembunyi yang bikin mati:', err);
});