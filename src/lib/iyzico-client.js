import crypto from 'crypto';

export function generatePaytrToken({
    merchant_id,
    user_ip,
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
}) {
    const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${payment_type}${installment_count}${currency}${test_mode}${non_3d}`;
    const paytr_token = crypto
        .createHmac('sha256', merchant_key)
        .update(hashSTR + merchant_salt)
        .digest('base64');
    return paytr_token;
}