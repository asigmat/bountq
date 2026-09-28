import pool from '../../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../../lib/auth';



export async function PUT(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await request.json();
        const {
            code,
            discount_type,
            discount_value,
            min_order_amount,
            usage_limit,
            expires_at,
            is_active,
        } = body;

        const { rows } = await pool.query(
            `UPDATE coupons 
       SET code = $1, discount_type = $2, discount_value = $3, 
           min_order_amount = $4, usage_limit = $5, expires_at = $6, is_active = $7
       WHERE id = $8
       RETURNING *`,
            [
                code.toUpperCase().trim(),
                discount_type,
                parseFloat(discount_value),
                parseFloat(min_order_amount) || 0,
                usage_limit ? parseInt(usage_limit) : null,
                expires_at || null,
                is_active,
                id,
            ]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Kupon bulunamadı' }, { status: 404 });
        }

        return Response.json(rows[0]);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Silinemedi' }, { status: 500 });
    }
}