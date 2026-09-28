import pool from '../../../lib/db';
export const dynamic = 'force-dynamic';





export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const categoryId = searchParams.get('category_id');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const size = searchParams.get('size');
    const sort = searchParams.get('sort');

    let query = `SELECT p.id, p.name, p.description, p.price, p.stock,
                 p.image_urls, p.sizes, p.category_id, p.created_at,
                 c.name AS category_name, c.slug AS category_slug
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id`;
    const conditions = [];
    const params = [];

    // Kategori (slug)
    if (categorySlug && categorySlug.trim()) {
      conditions.push(`c.slug = $${params.length + 1}`);
      params.push(categorySlug.trim());
    }

    // Kategori (ID)
    if (categoryId && categoryId.trim()) {
      conditions.push(`p.category_id = $${params.length + 1}`);
      params.push(parseInt(categoryId));
    }

    // Arama
    if (search && search.trim()) {
      conditions.push(`p.name ILIKE $${params.length + 1}`);
      params.push(`%${search.trim()}%`);
    }

    // Min fiyat
    if (minPrice && minPrice.trim()) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        conditions.push(`p.price >= $${params.length + 1}`);
        params.push(min);
      }
    }

    // Max fiyat
    if (maxPrice && maxPrice.trim()) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        conditions.push(`p.price <= $${params.length + 1}`);
        params.push(max);
      }
    }

    // Beden (array içinde kontrol)
    if (size && size.trim()) {
      conditions.push(`$${params.length + 1} = ANY(COALESCE(p.sizes, ARRAY[]::text[]))`);
      params.push(size.trim());
    }

    // WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sıralama
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    // Limit
    if (limit && limit.trim()) {
      const lim = parseInt(limit);
      if (!isNaN(lim) && lim > 0) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(lim);
      }
    }

    const { rows } = await pool.query(query, params);
    return Response.json(rows, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('PRODUCTS LIST ERROR:', error.message);
    return Response.json({ error: 'Ürünler alınamadı' }, { status: 500 });
  }
}
