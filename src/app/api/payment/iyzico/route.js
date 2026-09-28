export const dynamic = 'force-dynamic';

// ═══ MERKEZİ POOL KULLAN ═══
import pool from '../../../../lib/db';
import { generatePaytrToken } from '../../../../lib/iyzico-client';

// ═══ TELEFON NORMALIZE ═══
function normalizePhone(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) return '90' + digits.substring(1);
    if (digits.startsWith('90')) return digits;
    if (digits.length === 10) return '90' + digits;
    return digits;
}

export async function POST(request) {
    try {
        const { orderId, buyer } = await request.json();

        // ═══ TELEFON ZORUNLU ═══
        if (!buyer?.phone) {
            return Response.json({ error: 'Telefon numarası gerekli' }, { status: 400 });
        }

        // ═══ SİPARİŞ KONTROLÜ ═══
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        const order = orderResult.rows[0];

        if (order.payment_status !== 'PENDING') {
            return Response.json({
                error: 'Bu sipariş için ödeme zaten işleme alınmış'
            }, { status: 400 });
        }

        // ═══ TELEFON TAM EŞLEŞME (zorunlu) ═══
        const orderPhone = normalizePhone(order.customer_phone);
        const buyerPhone = normalizePhone(buyer.phone);

        if (orderPhone !== buyerPhone) {
            return Response.json({ error: 'Sipariş bilgileri eşleşmiyor' }, { status: 403 });
        }

        // ═══ SİPARİŞ KALEMLERİ ═══
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name AS product_name FROM order_items oi 
       JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
            [orderId]
        );
        const items = itemsResult.rows;

        const totalAmount = parseFloat(order.total_amount);
        const discountAmount = parseFloat(order.discount_amount || 0);

        // ═══ SEPET KALEMLERİ (TL formatı — PayTR sepet satırları için) ═══
        const basketItems = items.map(item => ({
            id: item.product_id.toString(),
            name: item.product_name,
            category1: 'Giyim',
            itemType: 'PHYSICAL',
            price: (parseFloat(item.unit_price) * item.quantity).toFixed(2),
        }));

        if (discountAmount > 0) {
            basketItems.push({
                id: 'DISCOUNT',
                name: 'İndirim' + (order.coupon_code ? ` (${order.coupon_code})` : ''),
                category1: 'İndirim',
                itemType: 'VIRTUAL',
                price: (-discountAmount).toFixed(2),
            });
        }

        const itemsTotal = items.reduce(
            (sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0
        );
        const afterDiscount = itemsTotal - discountAmount;
        const shippingFee = totalAmount - afterDiscount;

        if (shippingFee > 0.01) {
            basketItems.push({
                id: 'SHIPPING',
                name: 'Kargo Ücreti',
                category1: 'Kargo',
                itemType: 'PHYSICAL',
                price: shippingFee.toFixed(2),
            });
        }

        // ═══ SEPET TOPLAMI KONTROLÜ ═══
        const basketTotal = basketItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
        if (Math.abs(basketTotal - totalAmount) > 0.01) {
            console.error('BASKET MISMATCH:', { basketTotal, totalAmount, discountAmount, shippingFee });
            return Response.json({ error: 'Sepet tutarlarında uyuşmazlık' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // ═══ GERÇEK CLIENT IP ═══
        // These headers are trustworthy only when the hosting proxy overwrites client-supplied values.
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip')
            || request.headers.get('cf-connecting-ip')
            || (forwarded ? forwarded.split(',')[0].trim() : null)
            || '85.34.78.112';

        // ═══ TELEFON FORMATI (PayTR user_phone için) ═══
        const user_phone = buyer.phone.replace(/\D/g, '');

        // ═══ TEST MODU (env kontrolü) ═══
        // Öncelik: PAYTR_TEST_MODE env > production'da '0' > dev'de '1'
        const isProd = process.env.NODE_ENV === 'production';
        const test_mode = process.env.PAYTR_TEST_MODE !== undefined
            ? process.env.PAYTR_TEST_MODE
            : (isProd ? '0' : '1');
        const debug_on = isProd ? '0' : '1';

        // ═══ PAYTR AYARLARI ═══
        const merchant_id = process.env.PAYTR_MERCHANT_ID;
        const merchant_key = process.env.PAYTR_MERCHANT_KEY;
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
        const merchant_oid = 'SKB' + orderId.toString().padStart(6, '0');
        const email = buyer.email || 'musteri@ornek.com';

        // ═══ KRİTİK: PayTR payment_amount KURUŞ formatında (integer string) ═══
        // 1635.99 TL → "163599"
        const payment_amount = String(Math.round(totalAmount * 100));

        const payment_type = 'card';
        const installment_count = '0';
        const currency = 'TL';
        const non_3d = '0';
        const merchant_ok_url = `${baseUrl}/odeme-basarili`;
        const merchant_fail_url = `${baseUrl}/odeme-basarisiz`;
        const user_name = buyer.name || 'Misafir';
        const user_address = buyer.address || order.shipping_address;
        const client_lang = 'tr';
        const non3d_test_failed = '0';
        const card_type = '';

        // PayTR sepet: [isim, fiyat_TL_string, adet]
        const user_basket = basketItems.map(item => [item.name, item.price, 1]);

        // ═══ TOKEN — payment_amount kuruş formatı ile aynı olmalı ═══
        const paytr_token = generatePaytrToken({
            merchant_id,
            user_ip: realIp,
            merchant_oid,
            email,
            payment_amount,
            payment_type,
            installment_count,
            currency,
            test_mode,
            non_3d,
            merchant_key,
            merchant_salt,
        });

        const paymentData = {
            merchant_id,
            user_ip: realIp,
            merchant_oid,
            email,
            payment_type,
            payment_amount,
            currency,
            test_mode,
            non_3d,
            merchant_ok_url,
            merchant_fail_url,
            user_name,
            user_address,
            user_phone,
            user_basket: JSON.stringify(user_basket),
            debug_on,
            client_lang,
            paytr_token,
            non3d_test_failed,
            installment_count,
            card_type,
        };

        return Response.json({ paymentData });
    } catch (error) {
        console.error('PAYTR FULL ERROR:', error.message);
        return Response.json({ error: 'Ödeme başlatılamadı' }, { status: 500 });
    }
}
