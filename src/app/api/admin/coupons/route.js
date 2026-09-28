import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../lib/auth';



export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const { rows } = await pool.query(
            'SELECT * FROM coupons ORDER BY created_at DESC'
        );
        return Response.json(rows);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Kuponlar alınamadı' }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const body = await request.json();
        const {
            code,
            discount_type,
            discount_value,
            min_order_amount,
            usage_limit,
            expires_at,
        } = body;

        if (!code || !discount_value) {
            return Response.json({ error: 'Kupon kodu ve indirim değeri gerekli' }, { status: 400 });
        }

        const cleanCode = code.toUpperCase().trim();

        const { rows } = await pool.query(
            `INSERT INTO coupons 
       (code, discount_type, discount_value, min_order_amount, usage_limit, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                cleanCode,
                discount_type || 'percent',
                parseFloat(discount_value),
                parseFloat(min_order_amount) || 0,
                usage_limit ? parseInt(usage_limit) : null,
                expires_at || null,
            ]
        );

        return Response.json(rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return Response.json({ error: 'Bu kupon kodu zaten mevcut' }, { status: 400 });
        }
        return Response.json({ error: 'Kupon eklenemedi' }, { status: 500 });
    }
}