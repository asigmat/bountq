export const dynamic = 'force-dynamic';

// ═══ MERKEZİ POOL KULLAN ═══
import pool from '../../../../../lib/db';
import crypto from 'crypto';

async function releaseOrderReservations(client, orderId, couponCode) {
    const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
    );
    for (const item of items.rows) {
        await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
    }
    if (couponCode) {
        await client.query(
            'UPDATE coupons SET used_count = GREATEST(used_count - 1, 0) WHERE code = $1',
            [couponCode]
        );
    }
}

export async function POST(request) {
    let client;
    try {
        const formData = await request.formData();
        const merchant_oid = formData.get('merchant_oid');
        const status = formData.get('status');
        const total_amount = formData.get('total_amount');
        const hash = formData.get('hash');

        const merchant_key = process.env.PAYTR_MERCHANT_KEY;
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        // ═══ HASH DOĞRULAMA ═══
        const token = crypto
            .createHmac('sha256', merchant_key)
            .update(merchant_oid + merchant_salt + status + total_amount)
            .digest('base64');

        if (token !== hash) {
            console.error('PAYTR hash doğrulama başarısız');
            return new Response('FAILED', { status: 400 });
        }

        const orderId = parseInt(merchant_oid.replace('SKB', '').replace(/^0+/, ''));

        // ═══ TRANSACTION BAŞLAT ═══
        client = await pool.connect();
        await client.query('BEGIN');

        // Siparişi kilitle
        const orderResult = await client.query(
            'SELECT id, total_amount, payment_status, coupon_code FROM orders WHERE id = $1 FOR UPDATE',
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            console.error('CALLBACK: Sipariş bulunamadı', orderId);
            return new Response('OK', { status: 200 });
        }

        const order = orderResult.rows[0];

        // ═══ IDEMPOTENCY: Zaten işlenmişse çık ═══
        if (order.payment_status !== 'PENDING') {
            await client.query('ROLLBACK');
            console.log('CALLBACK: Sipariş zaten işlenmiş', orderId);
            return new Response('OK', { status: 200 });
        }

        // ═══ TUTAR KARŞILAŞTIRMASI (kuruş → TL) ═══
        const paytrAmount = parseFloat(total_amount) / 100;
        const dbAmount = parseFloat(order.total_amount);

        if (status === 'success' && Math.abs(paytrAmount - dbAmount) > 0.01) {
            console.error('CALLBACK: TUTAR UYUŞMAZLIĞI', { orderId, paytrAmount, dbAmount });
            await client.query(
                `UPDATE orders SET payment_status = 'FAILED', admin_note = $1 WHERE id = $2`,
                [`Tutar uyuşmazlığı: PayTR=${paytrAmount}, DB=${dbAmount}`, orderId]
            );
            await releaseOrderReservations(client, orderId, order.coupon_code);
            await client.query('COMMIT');
            return new Response('OK', { status: 200 });
        }

        // ═══ FAILED DURUMU ═══
        if (status !== 'success') {
            await client.query(
                `UPDATE orders SET payment_status = 'FAILED' WHERE id = $1 AND payment_status = 'PENDING'`,
                [orderId]
            );
            await releaseOrderReservations(client, orderId, order.coupon_code);
            await client.query('COMMIT');
            console.log('❌ PayTR ödeme başarısız:', merchant_oid);
            return new Response('OK', { status: 200 });
        }

        // Stok ve varsa kupon kullanımı sipariş transaction'ında rezerve edildi.
        const updateResult = await client.query(
            `UPDATE orders 
       SET status = 'PAID', payment_status = 'SUCCESS', payment_transaction_id = $1 
       WHERE id = $2 AND payment_status = 'PENDING'
       RETURNING id`,
            [merchant_oid, orderId]
        );

        if (updateResult.rows.length === 0) {
            // Başka bir callback önce davrandı
            await client.query('ROLLBACK');
            return new Response('OK', { status: 200 });
        }

        await client.query('COMMIT');
        console.log('✅ PayTR ödeme başarılı:', merchant_oid);

        return new Response('OK', { status: 200 });
    } catch (error) {
        if (client) {
            try { await client.query('ROLLBACK'); } catch { }
        }
        console.error('PAYTR CALLBACK ERROR:', error.message);
        return new Response('OK', { status: 200 });
    } finally {
        if (client) client.release();
    }
}
