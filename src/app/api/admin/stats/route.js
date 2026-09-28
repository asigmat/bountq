import pool from '../../../../lib/db';
import { verifyAdmin } from '../../../../lib/auth';
export const dynamic = 'force-dynamic';



export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const products = await pool.query('SELECT COUNT(*) FROM products');
        const orders = await pool.query('SELECT COUNT(*) FROM orders');
        const revenue = await pool.query(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'SUCCESS'"
        );

        return Response.json({
            products: parseInt(products.rows[0].count),
            orders: parseInt(orders.rows[0].count),
            revenue: parseFloat(revenue.rows[0].total)
        });
    } catch (error) {
        console.error(error);
        return Response.json({ products: 0, orders: 0, revenue: 0 });
    }
}