import pool from '../../../../../lib/db';
export const dynamic = 'force-dynamic';


import { verifyAdmin } from '../../../../../lib/auth';



export async function PUT(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await request.json();
        const { status, admin_note } = body;

        const { rows } = await pool.query(
            `UPDATE return_requests 
       SET status = $1, admin_note = $2
       WHERE id = $3
       RETURNING *`,
            [status || 'PENDING', admin_note || null, id]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Talep bulunamadı' }, { status: 404 });
        }

        return Response.json(rows[0]);
    } catch (error) {
        console.error('ADMIN RETURN UPDATE ERROR:', error);
        return Response.json({ error: 'Güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    try {
        await pool.query('DELETE FROM return_requests WHERE id = $1', [id]);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Silinemedi' }, { status: 500 });
    }
}