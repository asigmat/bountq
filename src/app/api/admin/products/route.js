import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../lib/auth';



export async function GET(request) {
    // ═══ AUTH ZORUNLU ═══
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        return Response.json(rows);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Ürünler alınamadı' }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, description, price, stock, image_urls, sizes, category_id } = body;

        const { rows } = await pool.query(
            `INSERT INTO products (name, description, price, stock, image_urls, sizes, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, description, price, stock, image_urls || [], sizes || ['S', 'M', 'L', 'XL'], category_id || null]
        );

        return Response.json(rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Ürün eklenemedi' }, { status: 500 });
    }

}