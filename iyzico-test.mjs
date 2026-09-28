import https from 'https';

function makeRequest(url, headers, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(body),
      },
      servername: urlObj.hostname,
      family: 4,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.2',
      ciphers: 'DEFAULT@SECLEVEL=1',
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 200) }));
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

const url = 'https://sandbox-api.iyzipay.com/payment/iyzipay/checkoutform/initialize/auth/ecom';

// ═══ TEST A: Küçük body, basit header ═══
console.log('=== TEST A: Küçük body ===');
try {
  const r = await makeRequest(url,
    { 'Content-Type': 'application/json', 'Authorization': 'test' },
    JSON.stringify({ test: true })
  );
  console.log('✅ Status:', r.status);
  console.log('Body:', r.body);
} catch (e) { console.log('❌ Hata:', e.message, e.code); }

// ═══ TEST B: Uzun Authorization header ═══
console.log('\n=== TEST B: Uzun Auth header ===');
const longAuth = 'IYZWSv2 ' + Buffer.from('apiKey:sandbox-94VtoXiZxqbC3hjr6r59uPzPGALmql97&randomKey:ABCD1234&signature:' + 'x'.repeat(44)).toString('base64');
console.log('Auth uzunluğu:', longAuth.length);
try {
  const r = await makeRequest(url,
    { 'Content-Type': 'application/json', 'Authorization': longAuth },
    JSON.stringify({ test: true })
  );
  console.log('✅ Status:', r.status);
  console.log('Body:', r.body);
} catch (e) { console.log('❌ Hata:', e.message, e.code); }

// ═══ TEST C: Büyük body + Türkçe karakter ═══
console.log('\n=== TEST C: Büyük body + Türkçe ===');
const bigBody = JSON.stringify({
  locale: 'tr',
  conversationId: '1',
  price: '669.98',
  paidPrice: '669.98',
  currency: 'TRY',
  basketId: '1',
  paymentGroup: 'PRODUCT',
  callbackUrl: 'http://localhost:3000/api/payment/iyzico/callback',
  enabledInstallments: [1, 2, 3, 6, 9],
  buyer: {
    id: 'BY1', name: 'Test', surname: 'Kullanıcı',
    gsmNumber: '+905551234567',
    email: 'test@test.com', identityNumber: '11111111111',
    registrationAddress: 'Test Mahallesi Test Sokak No:1',
    ip: '85.34.78.161', city: 'İstanbul', country: 'Turkey',
  },
  shippingAddress: { contactName: 'Test', city: 'İstanbul', country: 'Turkey', address: 'Test Mahallesi' },
  billingAddress: { contactName: 'Test', city: 'İstanbul', country: 'Turkey', address: 'Test Mahallesi' },
  basketItems: [{ id: '1', name: 'Ürün Adı', category1: 'Giyim', itemType: 'PHYSICAL', price: '599.99' }],
});
console.log('Body uzunluğu:', bigBody.length);
try {
  const r = await makeRequest(url,
    { 'Content-Type': 'application/json', 'Authorization': longAuth },
    bigBody
  );
  console.log('✅ Status:', r.status);
  console.log('Body:', r.body);
} catch (e) { console.log('❌ Hata:', e.message, e.code); }