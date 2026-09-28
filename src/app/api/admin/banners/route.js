import pool from '../../../../lib/db';
import { verifyAdmin } from '../../../../lib/auth';
export const dynamic = 'force-dynamic';
// ... geri kalan kod


export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const { rows } = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
        return Response.json(rows);
    } catch (error) {
        return Response.json({ error: 'Hata' }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const body = await request.json();
        const { title, subtitle, image_url, button_text, button_link, type, sort_order } = body;

        const { rows } = await pool.query(
            `INSERT INTO banners (title, subtitle, image_url, button_text, button_link, type, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, subtitle, image_url, button_text, button_link, type || 'hero', sort_order || 0]
        );

        return Response.json(rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Eklenemedi' }, { status: 500 });
    }
}