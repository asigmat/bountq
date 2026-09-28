import pool from '../../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../../lib/auth';



// GET: Sipariş detayı
export async function GET(request, { params }) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;

  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_urls, p.sizes
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    );

    return Response.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('ADMIN ORDER DETAIL ERROR:', error);
    return Response.json({ error: 'Hata' }, { status: 500 });
  }
}

// PUT: Sipariş güncelle
export async function PUT(request, { params }) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, tracking_no, cargo_company, admin_note } = body;

    const { rows } = await pool.query(
      `UPDATE orders 
       SET status = $1, tracking_no = $2, cargo_company = $3, admin_note = $4
       WHERE id = $5
       RETURNING *`,
      [
        status || 'PENDING',
        tracking_no || null,
        cargo_company || null,
        admin_note || null,
        id
      ]
    );

    if (rows.length === 0) {
      return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error('ADMIN ORDER UPDATE ERROR:', error);
    return Response.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

// DELETE: Sipariş sil
export async function DELETE(request, { params }) {
  const admin = verifyAdmin(request);
  if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;

  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error('ADMIN ORDER DELETE ERROR:', error);
    return Response.json({ error: 'Silinemedi' }, { status: 500 });
  }
}