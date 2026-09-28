import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../../../lib/db';
import { rateLimit } from '../../../../lib/rate-limit';

export async function POST(request) {
    const limit = rateLimit(request, 'admin-login', 5);
    if (limit.limited) return Response.json({ error: 'Çok fazla deneme. Daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    try {
        const { email, password } = await request.json();

        const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (rows.length === 0) {
            return Response.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
        }

        const admin = rows[0];
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) {
            return Response.json({ error: 'Şifre hatalı' }, { status: 401 });
        }

        if (!process.env.JWT_SECRET) {
            return Response.json({ error: 'Giriş yapılandırması eksik' }, { status: 500 });
        }
        const token = jwt.sign(
            { adminId: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const response = Response.json({ success: true });
        response.headers.append(
            'Set-Cookie',
            `admin_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        );
        return response;
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Giriş başarısız' }, { status: 500 });
    }
}
