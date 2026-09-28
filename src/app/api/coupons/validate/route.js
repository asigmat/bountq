import pool from '../../../../lib/db';
export const dynamic = 'force-dynamic';





export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return Response.json({ error: 'Kupon kodu gerekli' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    const { rows } = await pool.query(
      `SELECT code, discount_type, discount_value, min_order_amount,
              usage_limit, used_count, expires_at
       FROM coupons 
       WHERE code = $1 AND is_active = true`,
      [cleanCode]
    );

    if (rows.length === 0) {
      return Response.json({ error: 'Geçersiz kupon kodu' }, { status: 404 });
    }

    const coupon = rows[0];

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ error: 'Bu kuponun süresi dolmuş' }, { status: 400 });
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return Response.json({ error: 'Bu kupon kullanım limitine ulaşmış' }, { status: 400 });
    }

    const total = parseFloat(orderTotal || 0);
    if (total < parseFloat(coupon.min_order_amount)) {
      return Response.json({ 
        error: `Bu kupon için minimum sepet tutarı ₺${parseFloat(coupon.min_order_amount).toFixed(2)}` 
      }, { status: 400 });
    }

    // ═══ ÖNİZLEME (tahmini) — kesin tutar sipariş oluştururken hesaplanacak ═══
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (total * parseFloat(coupon.discount_value)) / 100;
    } else {
      discount = parseFloat(coupon.discount_value);
    }
    discount = Math.min(discount, total);

    return Response.json({
      success: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      discount_amount: parseFloat(discount.toFixed(2)),
      is_preview: true, // client bunun tahmini olduğunu bilsin
      message: `Tahmini indirim: ₺${discount.toFixed(2)}`,
    });
  } catch (error) {
    console.error('COUPON VALIDATE ERROR:', error);
    return Response.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}