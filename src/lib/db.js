// src/lib/db.js
// ═══ MERKEZİ POSTGRES POOL ═══
// Tüm API route'ları bu pool'u kullanmalı. Yeni pool açma.
// SSL davranışı production'da zorunlu doğrulama ile çalışır.

import { Pool } from 'pg';

// Production'da SSL doğrulaması zorunlu; dev'de kolaylık için kapalı
const isProd = process.env.NODE_ENV === 'production';
const rejectUnauthorizedEnv = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;

// Öncelik: env değişkeni > production kuralı > dev varsayılanı
const rejectUnauthorized = isProd || rejectUnauthorizedEnv === 'true';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('DB POOL ERROR:', err.message);
});

export default pool;
