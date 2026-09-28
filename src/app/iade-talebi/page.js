'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const REASONS = [
    'Beden uymadı',
    'Ürün beklediğim gibi değil',
    'Hasarlı/kusurlu ürün geldi',
    'Yanlış ürün gönderildi',
    'Renk farklı çıktı',
    'Diğer',
];

export default function ReturnRequestPage() {
    const [step, setStep] = useState(1); // 1: sipariş no, 2: ürün seç, 3: sebep, 4: başarılı
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form, setForm] = useState({
        orderNo: '',
        phone: '',
        request_type: 'return',
        reason: '',
        customReason: '',
    });

    // ADIM 1: Siparişi bul
    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                orderNo: form.orderNo,
                phone: form.phone,
            });
            const res = await fetch(`/api/returns?${params}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Sipariş bulunamadı');
            } else {
                setOrderData(data);
                setStep(2);
            }
        } catch (err) {
            setError('Bağlantı hatası');
        }
        setLoading(false);
    };

    // ADIM 2: Ürün seç
    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setStep(3);
    };

    // ADIM 3: Talebi gönder
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const finalReason = form.reason === 'Diğer' ? form.customReason : form.reason;

            const res = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNo: form.orderNo,
                    phone: form.phone,
                    product_id: selectedItem?.product_id,
                    request_type: form.request_type,
                    reason: finalReason,
                    size: null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Talep oluşturulamadı');
            } else {
                setStep(4);
            }
        } catch (err) {
            setError('Bağlantı hatası');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {/* Başlık */}
            <div className="text-center mb-12">
                <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                    İade & Değişim
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-4">
                    İade / Değişim Talebi
                </h1>
                <p className="text-brand-500 text-sm max-w-md mx-auto">
                    14 gün içinde koşulsuz iade hakkınız vardır.
                </p>
            </div>

            {/* Adım Göstergesi */}
            <div className="flex items-center justify-center gap-2 mb-10">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step >= s ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-brand-900' : 'bg-gray-200'}`} />}
                    </div>
                ))}
            </div>

            {/* HATA */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm text-center mb-6">
                    {error}
                </div>
            )}

            {/* ADIM 1: Sipariş Sorgulama */}
            {step === 1 && (
                <motion.form
                    onSubmit={handleLookup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-brand-100 p-6 md:p-8 space-y-5"
                >
                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                            Sipariş Numarası *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.orderNo}
                            onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                            placeholder="SKB000001"
                            className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                            Telefon Numarası *
                        </label>
                        <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="05XX XXX XX XX"
                            className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-900 text-white py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 transition disabled:opacity-40"
                    >
                        {loading ? 'Aranıyor...' : 'Siparişi Bul'}
                    </button>
                </motion.form>
            )}

            {/* ADIM 2: Ürün Seç */}
            {step === 2 && orderData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-brand-100 p-6 md:p-8"
                >
                    <div className="mb-6">
                        <p className="text-xs tracking-widest uppercase text-brand-500 mb-1">Sipariş No</p>
                        <p className="font-mono text-sm font-medium">{orderData.order.orderNo}</p>
                    </div>
                    <h2 className="text-sm font-medium text-brand-900 mb-4">Hangi ürünü iade etmek istiyorsunuz?</h2>
                    <div className="space-y-3">
                        {orderData.items.map((item) => (
                            <button
                                key={item.order_item_id}
                                onClick={() => handleSelectItem(item)}
                                className="w-full flex items-center gap-4 p-4 border border-brand-100 hover:border-brand-900 hover:bg-brand-50 transition text-left"
                            >
                                {item.image_urls?.[0] && (
                                    <img
                                        src={item.image_urls[0]}
                                        alt={item.product_name}
                                        className="w-16 h-20 object-cover bg-brand-50"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-brand-900">{item.product_name}</p>
                                    <p className="text-xs text-brand-400 mt-1">Adet: {item.quantity}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { setStep(1); setSelectedItem(null); }}
                        className="mt-6 text-xs text-brand-500 underline"
                    >
                        ← Geri Dön
                    </button>
                </motion.div>
            )}

            {/* ADIM 3: Sebep ve Tür */}
            {step === 3 && selectedItem && (
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-brand-100 p-6 md:p-8 space-y-5"
                >
                    <div className="flex items-center gap-4 pb-4 border-b border-brand-100">
                        {selectedItem.image_urls?.[0] && (
                            <img
                                src={selectedItem.image_urls[0]}
                                alt={selectedItem.product_name}
                                className="w-16 h-20 object-cover"
                            />
                        )}
                        <div>
                            <p className="font-medium text-sm">{selectedItem.product_name}</p>
                            <p className="text-xs text-brand-400 mt-1">
                                ₺{parseFloat(selectedItem.unit_price).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-3">
                            Talep Türü *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'return', label: 'İade' },
                                { value: 'exchange', label: 'Değişim' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, request_type: opt.value })}
                                    className={`py-3 border text-sm font-medium transition ${form.request_type === opt.value
                                            ? 'bg-brand-900 text-white border-brand-900'
                                            : 'bg-white text-brand-700 border-brand-200 hover:border-brand-900'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                            Sebep *
                        </label>
                        <select
                            required
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                        >
                            <option value="">Sebep Seçin</option>
                            {REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {form.reason === 'Diğer' && (
                        <div>
                            <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                                Sebebinizi Yazın *
                            </label>
                            <textarea
                                required
                                rows="3"
                                value={form.customReason}
                                onChange={(e) => setForm({ ...form, customReason: e.target.value })}
                                className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="flex-1 bg-gray-200 text-gray-700 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-gray-300"
                        >
                            Geri
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-900 text-white py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 disabled:opacity-40"
                        >
                            {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* ADIM 4: Başarılı */}
            {step === 4 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-brand-100 p-12 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-brand-900 mb-3">Talebiniz Alındı</h2>
                    <p className="text-brand-500 text-sm mb-8 max-w-md mx-auto">
                        İade/değişim talebiniz başarıyla oluşturuldu. En kısa sürede size dönüş yapacağız.
                    </p>
                    <button
                        onClick={() => {
                            setStep(1);
                            setOrderData(null);
                            setSelectedItem(null);
                            setForm({ orderNo: '', phone: '', request_type: 'return', reason: '', customReason: '' });
                        }}
                        className="text-sm text-brand-900 underline hover:text-brand-600"
                    >
                        Yeni Talep Oluştur
                    </button>
                </motion.div>
            )}
        </div>
    );
}