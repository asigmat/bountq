import pool from '../../../lib/db';
export const dynamic = 'force-dynamic';





export async function GET() {
    try {
        const { rows } = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        return Response.json(rows, {
            headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Kategoriler alınamadı' }, { status: 500 });
    }
}
