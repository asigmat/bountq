import pool from '../../../../../lib/db';
import { verifyAdmin } from '../../../../../lib/auth';



export async function GET(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (rows.length === 0) return Response.json({ error: 'Bulunamadı' }, { status: 404 });
        return Response.json(rows[0]);
    } catch (error) {
        return Response.json({ error: 'Hata' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, description, price, stock, image_urls, sizes, category_id } = body;

        const { rows } = await pool.query(
            `UPDATE products 
       SET name=$1, description=$2, price=$3, stock=$4, image_urls=$5, sizes=$6, category_id=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
            [name, description, price, stock, image_urls || [], sizes || [], category_id || null, id]
        );

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
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return Response.json({ success: true });
    } catch (error) {
        console.error('DELETE ERROR:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}