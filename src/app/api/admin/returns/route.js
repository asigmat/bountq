import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../lib/auth';



export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = `
      SELECT r.*, p.name AS product_name, p.image_urls,
             o.customer_name, o.total_amount
      FROM return_requests r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN orders o ON r.order_id = o.id
    `;
        const params = [];

        if (status && status !== 'all') {
            query += ' WHERE r.status = $1';
            params.push(status);
        }

        query += ' ORDER BY r.created_at DESC';

        const { rows } = await pool.query(query, params);
        return Response.json(rows);
    } catch (error) {
        console.error('ADMIN RETURNS LIST ERROR:', error);
        return Response.json({ error: 'Talepler alınamadı' }, { status: 500 });
    }
}