'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';

export default function CheckoutPage() {
  const { notify } = useToast();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  });

  // ═══ KUPON STATE ═══
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ═══ TOPLAM HESAPLAMA (KUPON DAHİL) ═══
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = couponApplied ? couponApplied.discount_amount : 0;
  const afterDiscount = Math.max(0, total - discount);
  const shipping = afterDiscount >= 2500 ? 0 : 69.99;
  const grandTotal = afterDiscount + shipping;

  // ═══ KUPON UYGULA ═══
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: total }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || 'Kupon uygulanamadı');
        setCouponApplied(null);
      } else {
        setCouponApplied(data);
        setCouponError('');
      }
    } catch (err) {
      setCouponError('Bağlantı hatası');
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  // ═══ SİPARİŞ OLUŞTUR + PAYTR ═══
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      notify('Sepetiniz boş.', 'info');
      return;
    }

    setLoading(true);

    try {
      // 1. Siparişi veritabanına kaydet (server fiyatı hesaplar + kupon uygular)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          shipping_address: form.address + (form.city ? ', ' + form.city : ''),
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          coupon_code: couponApplied?.code || null,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        notify(err.error || 'Sipariş oluşturulamadı.', 'error');
        setLoading(false);
        return;
      }

      const { orderId } = await orderRes.json();

      // 2. PayTR ödeme verilerini al
      const paytrRes = await fetch('/api/payment/iyzico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          buyer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
          },
        }),
      });

      if (!paytrRes.ok) {
        const err = await paytrRes.json();
        notify(err.error || 'Ödeme başlatılamadı.', 'error');
        setLoading(false);
        return;
      }

      const { paymentData } = await paytrRes.json();

      // 3. Sepeti temizle
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));

      // 4. PayTR'ye form POST et
      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = 'https://www.paytr.com/odeme';
      formEl.style.display = 'none';

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        formEl.appendChild(input);
      });

      document.body.appendChild(formEl);
      formEl.submit();
    } catch (err) {
      console.error(err);
      notify('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="text-3xl font-serif font-bold text-brand-900 mb-10">Ödeme Bilgileri</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="text-xs tracking-[0.3em] uppercase font-medium text-brand-500 mb-5">
              Teslimat Bilgileri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">Ad Soyad *</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange}
                  className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">Telefon *</label>
                  <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                    className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">E-posta *</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange}
                    className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">Adres *</label>
                <textarea name="address" required value={form.address} onChange={handleChange} rows="3"
                  className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">Şehir *</label>
                <input type="text" name="city" required value={form.city} onChange={handleChange}
                  className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition" />
              </div>
            </div>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="bg-brand-50 p-4 flex items-start gap-3 text-xs text-brand-600">
            <LockClosedIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <p>
              Ödeme bilgileriniz <strong>PayTR</strong> güvencesiyle 256-bit SSL şifreleme ile korunmaktadır.
              Kart bilgileriniz sitemizde saklanmaz.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full bg-brand-900 text-white py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'İşleniyor...' : `Ödemeye Geç · ₺${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
          </button>
        </form>

        {/* Sipariş Özeti */}
        <div className="lg:col-span-2 bg-brand-50 p-6 md:p-8 h-fit">
          <h2 className="text-lg font-serif font-bold text-brand-900 mb-6">Sipariş Özeti</h2>
          {cartItems.length === 0 ? (
            <p className="text-sm text-brand-400">Sepetiniz boş.</p>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1 pr-3">
                      <p className="text-brand-800 font-medium">{item.name}</p>
                      <p className="text-xs text-brand-400">
                        {item.size && `Beden: ${item.size} · `}Adet: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-brand-900">
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* ═══ KUPON ALANI ═══ */}
              <div className="border-t border-brand-200 pt-4 mb-4">
                <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                  Kupon Kodu
                </label>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3">
                    <div>
                      <p className="text-xs font-mono font-bold text-green-800">
                        {couponApplied.code}
                      </p>
                      <p className="text-xs text-green-600">
                        -₺{couponApplied.discount_amount.toFixed(2)} indirim
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="KUPON10"
                        className="flex-1 border border-brand-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-brand-900"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="bg-brand-900 text-white px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-brand-800 disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Uygula'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-600 mt-2">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* ═══ TOPLAMLAR ═══ */}
              <div className="border-t border-brand-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brand-600">
                  <span>Ara Toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim ({couponApplied.code})</span>
                    <span>-₺{couponApplied.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-600">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-brand-900 text-base pt-2 border-t border-brand-200">
                  <span>Toplam</span>
                  <span>₺{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
