export const dynamic = 'force-dynamic';

// ═══ MERKEZİ POOL KULLAN ═══
import pool from '../../../lib/db';

const SHIPPING_THRESHOLD = 2500;
const SHIPPING_FEE = 69.99;

export async function POST(request) {
    const client = await pool.connect();

    try {
        const body = await request.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return Response.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
        }
        const {
            customer_name,
            customer_phone,
            customer_email,
            shipping_address,
            items,
            coupon_code,
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'Sepet boş' }, { status: 400 });
        }
        if (typeof customer_name !== 'string' || customer_name.trim().length < 2 || customer_name.length > 100
            || typeof customer_phone !== 'string' || !/^[0-9+\s()-]{10,20}$/.test(customer_phone)
            || typeof shipping_address !== 'string' || shipping_address.trim().length < 10 || shipping_address.length > 500
            || (customer_email != null && customer_email !== '' && (typeof customer_email !== 'string' || customer_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)))) {
            return Response.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
        }
        if (coupon_code != null && (typeof coupon_code !== 'string' || coupon_code.length > 50)) {
            return Response.json({ error: 'Geçersiz kupon kodu' }, { status: 400 });
        }

        if (items.length > 50) {
            return Response.json({ error: 'Sepette en fazla 50 farklı ürün olabilir' }, { status: 400 });
        }
        const quantities = new Map();
        for (const item of items) {
            const productId = Number(item?.product_id);
            const qty = Number(item?.quantity);
            if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(qty) || qty < 1 || qty > 100) {
                return Response.json({ error: 'Geçersiz ürün/adet' }, { status: 400 });
            }
            quantities.set(productId, (quantities.get(productId) || 0) + qty);
        }
        if ([...quantities.values()].some((qty) => qty > 100)) {
            return Response.json({ error: 'Bir üründen en fazla 100 adet sipariş edilebilir' }, { status: 400 });
        }
        const productIds = [...quantities.keys()];
        if (productIds.length === 0) {
            return Response.json({ error: 'Geçersiz ürün listesi' }, { status: 400 });
        }

        await client.query('BEGIN');

        // ═══ ÜRÜNLERİ KİLİTLE VE STOK YETERLİLİĞİNİ KONTROL ET ═══
        // Stok transaction içinde rezerve edilir; başarısız ödeme callback'inde geri yüklenir.
        const productsResult = await client.query(
            'SELECT id, price, stock, name FROM products WHERE id = ANY($1::int[]) FOR UPDATE',
            [productIds]
        );

        const productMap = {};
        for (const p of productsResult.rows) productMap[p.id] = p;

        const validatedItems = [];
        let subtotal = 0;

        for (const [productId, qty] of quantities) {
            const product = productMap[productId];
            if (!product) {
                await client.query('ROLLBACK');
                return Response.json({ error: `Ürün bulunamadı: ID ${productId}` }, { status: 400 });
            }
            if (product.stock < qty) {
                await client.query('ROLLBACK');
                return Response.json({
                    error: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock})`
                }, { status: 400 });
            }

            const unitPrice = parseFloat(product.price);
            subtotal += unitPrice * qty;
            validatedItems.push({ product_id: productId, quantity: qty, unit_price: unitPrice });
        }

        for (const item of validatedItems) {
            const reserved = await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id',
                [item.quantity, item.product_id]
            );
            if (reserved.rows.length === 0) {
                await client.query('ROLLBACK');
                return Response.json({ error: 'Stok yetersiz' }, { status: 400 });
            }
        }

        // ═══ KUPON KONTROLÜ (used_count SADECE KONTROL, ARTIRILMAZ) ═══
        // Artırma işlemi callback'te SUCCESS anında yapılır.
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (coupon_code) {
            const couponResult = await client.query(
                `SELECT id, code, discount_type, discount_value, min_order_amount,
                usage_limit, used_count, expires_at
         FROM coupons 
         WHERE code = $1 AND is_active = true 
         FOR UPDATE`,
                [coupon_code.toUpperCase().trim()]
            );

            if (couponResult.rows.length > 0) {
                const coupon = couponResult.rows[0];
                const notExpired = !coupon.expires_at || new Date(coupon.expires_at) >= new Date();
                const underLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
                const overMin = subtotal >= parseFloat(coupon.min_order_amount);

                if (notExpired && underLimit && overMin) {
                    if (coupon.discount_type === 'percent') {
                        discountAmount = (subtotal * parseFloat(coupon.discount_value)) / 100;
                    } else {
                        discountAmount = parseFloat(coupon.discount_value);
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                    const reservedCoupon = await client.query(
                        `UPDATE coupons SET used_count = used_count + 1
                         WHERE id = $1 AND (usage_limit IS NULL OR used_count < usage_limit)
                         RETURNING id`,
                        [coupon.id]
                    );
                    if (reservedCoupon.rows.length > 0) appliedCouponCode = coupon.code;
                    else discountAmount = 0;
                }
            }
        }

        const afterDiscount = subtotal - discountAmount;
        const shippingFee = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
        const totalAmount = parseFloat((afterDiscount + shippingFee).toFixed(2));

        // ═══ SİPARİŞ OLUŞTUR ═══
        const orderResult = await client.query(
            `INSERT INTO orders 
       (customer_name, customer_phone, customer_email, shipping_address, 
        total_amount, coupon_code, discount_amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', 'PENDING')
       RETURNING id`,
            [
                customer_name,
                customer_phone,
                customer_email || null,
                shipping_address,
                totalAmount,
                appliedCouponCode,
                discountAmount,
            ]
        );

        const orderId = orderResult.rows[0].id;

        for (const item of validatedItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.unit_price]
            );
        }

        await client.query('COMMIT');

        return Response.json({
            orderId,
            success: true,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            coupon_code: appliedCouponCode,
            shipping: shippingFee,
            total_amount: totalAmount,
        }, { status: 201 });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('ORDER ERROR:', error.message);
        return Response.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });
    } finally {
        client.release();
    }
}
