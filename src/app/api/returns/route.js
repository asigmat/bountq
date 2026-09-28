export const dynamic = 'force-dynamic';

import pool from '../../../lib/db';
import { rateLimit } from '../../../lib/rate-limit';

function normalizePhone(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) return '90' + digits.substring(1);
    if (digits.startsWith('90')) return digits;
    if (digits.length === 10) return '90' + digits;
    return digits;
}

export async function POST(request) {
    const limit = rateLimit(request, 'return-request');
    if (limit.limited) return Response.json({ error: 'Çok fazla deneme. Daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    try {
        const body = await request.json();
        const { orderNo, phone, product_id, request_type, reason, size } = body;

        if (!orderNo || !phone || !reason) {
            return Response.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
        }

        const orderId = parseInt(orderNo.toString().replace(/\D/g, '').replace(/^0+/, ''));
        if (!orderId) {
            return Response.json({ error: 'Geçersiz sipariş numarası' }, { status: 400 });
        }

        const orderResult = await pool.query(
            'SELECT id, customer_phone, payment_status FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }
        const order = orderResult.rows[0];
        const cleanPhone = normalizePhone(phone);
        const orderPhoneNormalized = normalizePhone(order.customer_phone);

        // ═══ TAM EŞLEŞME ═══
        if (orderPhoneNormalized !== cleanPhone) {
            return Response.json({ error: 'Telefon numarası eşleşmiyor' }, { status: 401 });
        }

        // ═══ ÖDEME DURUMU KONTROLÜ ═══
        // Sadece başarılı ödenmiş siparişler için iade talep edilebilir
        if (order.payment_status !== 'SUCCESS') {
            return Response.json({
                error: 'Sadece ödemesi tamamlanmış siparişler için iade talebi oluşturulabilir'
            }, { status: 400 });
        }

        // ═══ ÜRÜN SİPARİŞTE Mİ? ═══
        if (product_id) {
            const itemCheck = await pool.query(
                'SELECT 1 FROM order_items WHERE order_id = $1 AND product_id = $2',
                [orderId, parseInt(product_id)]
            );
            if (itemCheck.rows.length === 0) {
                return Response.json({
                    error: 'Bu ürün bu siparişe ait değil'
                }, { status: 400 });
            }
        }
        // ═══ AYNI SİPARİŞ İÇİN AKTİF TALEP VAR MI? (spam koruması) ═══
        const existing = await pool.query(
            `SELECT id FROM return_requests 
       WHERE order_id = $1 AND product_id = $2 AND status = 'PENDING'`,
            [orderId, product_id ? parseInt(product_id) : null]
        );

        if (existing.rows.length > 0) {
            return Response.json({
                error: 'Bu ürün için zaten bekleyen bir talebiniz var'
            }, { status: 400 });
        }

        const { rows } = await pool.query(
            `INSERT INTO return_requests 
       (order_id, customer_phone, product_id, request_type, reason, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [
                orderId,
                order.customer_phone, // DB'deki normalize edilmiş numarayı kullan
                product_id ? parseInt(product_id) : null,
                request_type || 'return',
                reason,
                size || null,
            ]
        );

        return Response.json({ success: true, request: rows[0] }, { status: 201 });
    } catch (error) {
        console.error('RETURN REQUEST ERROR:', error);
        return Response.json({ error: 'Talep oluşturulamadı' }, { status: 500 });
    }
}

export async function GET(request) {
    const limit = rateLimit(request, 'return-lookup');
    if (limit.limited) return Response.json({ error: 'Çok fazla deneme. Daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    try {
        const { searchParams } = new URL(request.url);
        const orderNo = searchParams.get('orderNo');
        const phone = searchParams.get('phone');

        if (!orderNo || !phone) {
            return Response.json({ error: 'Sipariş no ve telefon gerekli' }, { status: 400 });
        }

        const orderId = parseInt(orderNo.toString().replace(/\D/g, '').replace(/^0+/, ''));

        const orderResult = await pool.query(
            'SELECT id, customer_name, customer_phone, created_at FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        const order = orderResult.rows[0];
        const cleanPhone = normalizePhone(phone);
        const orderPhoneNormalized = normalizePhone(order.customer_phone);

        if (orderPhoneNormalized !== cleanPhone) {
            return Response.json({ error: 'Telefon numarası eşleşmiyor' }, { status: 401 });
        }

        const itemsResult = await pool.query(
            `SELECT oi.id AS order_item_id, oi.quantity, oi.unit_price, 
              p.id AS product_id, p.name AS product_name, p.image_urls, p.sizes
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
            [orderId]
        );

        return Response.json({
            order: {
                id: order.id,
                customer_name: order.customer_name,
                orderNo: 'SKB' + order.id.toString().padStart(6, '0'),
            },
            items: itemsResult.rows,
        });
    } catch (error) {
        console.error('RETURN LOOKUP ERROR:', error);
        return Response.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
