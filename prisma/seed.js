const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: isProd || process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' }
});

async function seed() {
    try {
        const email = process.env.ADMIN_EMAIL || 'admin@butik.com';
        const password = process.env.ADMIN_PASSWORD;
        if (!password || password.length < 12) {
            throw new Error('ADMIN_PASSWORD ortam değişkeni en az 12 karakter olmalıdır.');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING *',
            [email, passwordHash]
        );
        if (result.rows.length > 0) {
            console.log('✅ Admin oluşturuldu:', email);
        } else {
            console.log('ℹ️ Admin zaten mevcut:', email);
        }
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seed();
