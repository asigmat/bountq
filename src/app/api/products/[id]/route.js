import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';





export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const { rows } = await pool.query(
            `SELECT p.id, p.name, p.description, p.price, p.stock,
              p.image_urls, p.sizes, p.category_id, p.created_at,
              c.name AS category_name, c.slug AS category_slug
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
            [id]
        );
        if (rows.length === 0) {
            return Response.json({ error: 'Ürün bulunamadı' }, { status: 404 });
        }
        return Response.json(rows[0], {
            headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Hata' }, { status: 500 });
    }
}
