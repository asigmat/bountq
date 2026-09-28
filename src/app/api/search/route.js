import pool from '../../../lib/db';
export const dynamic = 'force-dynamic';





export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');

        if (!q || q.trim().length < 2) {
            return Response.json([]);
        }

        const { rows } = await pool.query(
            `SELECT p.id, p.name, p.price, p.image_urls, 
              c.name AS category_name, c.slug AS category_slug
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.name ILIKE $1 
       ORDER BY p.created_at DESC 
       LIMIT 8`,
            [`%${q.trim()}%`]
        );

        return Response.json(rows, {
            headers: { 'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=120' },
        });
    } catch (error) {
        console.error('SEARCH ERROR:', error);
        return Response.json({ error: 'Arama başarısız' }, { status: 500 });
    }
}
