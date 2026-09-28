import pool from '../../../../../lib/db';
import { verifyAdmin } from '../../../../../lib/auth';



export async function PUT(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;
    const bannerId = parseInt(id);

    try {
        const body = await request.json();
        const { title, subtitle, description, image_url, button_text, button_link, type, sort_order, is_active } = body;

        const { rows } = await pool.query(
            `UPDATE banners 
       SET title=$1, subtitle=$2, description=$3, image_url=$4, button_text=$5,
           button_link=$6, type=$7, sort_order=$8, is_active=$9 
       WHERE id=$10 
       RETURNING *`,
            [
                title || null,
                subtitle || null,
                description || null,
                image_url,
                button_text || null,
                button_link || null,
                type || 'hero',
                sort_order || 0,
                is_active === true || is_active === 'true',
                bannerId
            ]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Banner bulunamadı' }, { status: 404 });
        }

        return Response.json(rows[0]);
    } catch (error) {
        console.error('BANNER UPDATE ERROR:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;
    const bannerId = parseInt(id);

    try {
        await pool.query('DELETE FROM banners WHERE id = $1', [bannerId]);
        return Response.json({ success: true });
    } catch (error) {
        console.error('BANNER DELETE ERROR:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}