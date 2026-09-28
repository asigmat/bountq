export const dynamic = 'force-dynamic';

import pool from '../../../../lib/db';
import { rateLimit } from '../../../../lib/rate-limit';

// Türkiye telefon numarası normalize (905XXXXXXXXX formatı)
function normalizePhone(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) return '90' + digits.substring(1);
    if (digits.startsWith('90')) return digits;
    if (digits.length === 10) return '90' + digits;
    return digits;
}

export async function POST(request) {
    const limit = rateLimit(request, 'order-track');
    if (limit.limited) {
        return Response.json({ error: 'Çok fazla deneme. Daha sonra tekrar deneyin.' }, {
            status: 429,
            headers: { 'Retry-After': String(limit.retryAfter) },
        });
    }
    try {
        const { orderNo, phone } = await request.json();

        if (!orderNo || !phone) {
            return Response.json({ error: 'Sipariş no ve telefon gerekli' }, { status: 400 });
        }

        const cleanPhone = normalizePhone(phone);

        // ═══ TAM EŞLEŞME (IDOR koruması) ═══
        // Son rakam eşleşmesi yerine, tam numara eşleşmesi
        const orderId = parseInt(orderNo.toString().replace(/\D/g, '').replace(/^0+/, ''));
        if (!orderId) {
            return Response.json({ error: 'Geçersiz sipariş numarası' }, { status: 400 });
        }

        const orderResult = await pool.query(
            `SELECT id, customer_name, customer_phone, shipping_address,
              total_amount, status, payment_status, tracking_no, cargo_company, created_at
       FROM orders WHERE id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        const order = orderResult.rows[0];
        const orderPhoneNormalized = normalizePhone(order.customer_phone);

        // Tam eşleşme
        if (orderPhoneNormalized !== cleanPhone) {
            return Response.json({ error: 'Telefon numarası eşleşmiyor' }, { status: 401 });
        }

        const itemsResult = await pool.query(
            `SELECT oi.quantity, oi.unit_price, p.name AS product_name, p.image_urls
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
            [orderId]
        );

        return Response.json({
            order: {
                id: order.id,
                orderNo: 'SKB' + order.id.toString().padStart(6, '0'),
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                total_amount: parseFloat(order.total_amount),
                status: order.status,
                payment_status: order.payment_status,
                tracking_no: order.tracking_no,
                cargo_company: order.cargo_company,
                created_at: order.created_at,
            },
            items: itemsResult.rows,
        });
    } catch (error) {
        console.error('TRACK ERROR:', error);
        return Response.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
