import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../lib/auth';



// ═══ SADECE ADMIN LİSTELEME ═══
export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
    `;
        const conditions = [];
        const params = [];

        if (status && status !== 'all') {
            conditions.push(`o.status = $${params.length + 1}`);
            params.push(status);
        }

        if (search) {
            conditions.push(`(
        o.customer_name ILIKE $${params.length + 1} OR 
        o.customer_phone ILIKE $${params.length + 1} OR
        CAST(o.id AS TEXT) ILIKE $${params.length + 1}
      )`);
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY o.created_at DESC';

        const { rows } = await pool.query(query, params);
        return Response.json(rows);
    } catch (error) {
        console.error('ADMIN ORDERS LIST ERROR:', error);
        return Response.json({ error: 'Siparişler alınamadı' }, { status: 500 });
    }
}

// ═══ POST KALDIRILDI ═══
// Sipariş oluşturma işlemi /api/orders (public) üzerinden yapılıyor.
// Bu path'e POST izni verilmesi güvenlik açığı oluşturur.