'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, CheckCircleIcon, TruckIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_MAP = {
    PENDING: { label: 'Sipariş Alındı', icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    PAID: { label: 'Ödeme Onaylandı', icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' },
    PREPARING: { label: 'Hazırlanıyor', icon: ClockIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    SHIPPED: { label: 'Kargoda', icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    DELIVERED: { label: 'Teslim Edildi', icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' },
    CANCELLED: { label: 'İptal Edildi', icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function OrderTrackPage() {
    const [form, setForm] = useState({ orderNo: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/orders/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Sipariş bulunamadı');
            } else {
                setResult(data);
            }
        } catch (err) {
            setError('Bağlantı hatası');
        }
        setLoading(false);
    };

    const statusInfo = result ? (STATUS_MAP[result.order.status] || STATUS_MAP.PENDING) : null;
    const StatusIcon = statusInfo?.icon;

    return (
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {/* Başlık */}
            <div className="text-center mb-12">
                <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                    Sipariş Takibi
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-4">
                    Siparişinizi Takip Edin
                </h1>
                <p className="text-brand-500 text-sm max-w-md mx-auto">
                    Sipariş numaranızı ve telefon numaranızı girerek siparişinizin durumunu görebilirsiniz.
                </p>
            </div>

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-brand-100 p-6 md:p-8 mb-8"
            >
                <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                            Sipariş Numarası *
                        </label>
                        <input
                            type="text"
                            value={form.orderNo}
                            onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                            placeholder="SKB000001"
                            required
                            className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs tracking-widest uppercase text-brand-500 mb-2">
                            Telefon Numarası *
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="05XX XXX XX XX"
                            required
                            className="w-full border border-brand-200 px-4 py-3.5 text-sm focus:outline-none focus:border-brand-900 transition"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-900 text-white py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                    {loading ? 'Aranıyor...' : (
                        <>
                            <MagnifyingGlassIcon className="h-4 w-4" />
                            Siparişi Bul
                        </>
                    )}
                </button>
            </motion.form>

            {/* Hata */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm text-center mb-8">
                    {error}
                </div>
            )}

            {/* Sonuç */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Durum Kartı */}
                    <div className={`${statusInfo.bg} border border-brand-100 p-6`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${statusInfo.color}`}>
                                <StatusIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs tracking-widest uppercase text-brand-500">Sipariş Durumu</p>
                                <p className={`text-xl font-serif font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                            </div>
                        </div>
                        {result.order.tracking_no && (
                            <div className="mt-4 pt-4 border-t border-brand-200">
                                <p className="text-xs tracking-widest uppercase text-brand-500 mb-2">Kargo Takip</p>
                                <p className="text-sm text-brand-900">
                                    <strong>{result.order.cargo_company || 'Kargo'}:</strong> {result.order.tracking_no}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sipariş Bilgileri */}
                    <div className="bg-white border border-brand-100 p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs tracking-widest uppercase text-brand-500 mb-1">Sipariş No</p>
                                <p className="font-mono text-sm font-medium text-brand-900">
                                    {result.order.orderNo}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs tracking-widest uppercase text-brand-500 mb-1">Tarih</p>
                                <p className="text-sm text-brand-900">
                                    {new Date(result.order.created_at).toLocaleDateString('tr-TR', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Ürünler */}
                        <div className="border-t border-brand-100 pt-5 mb-5">
                            <p className="text-xs tracking-widest uppercase text-brand-500 mb-4">Ürünler</p>
                            <div className="space-y-4">
                                {result.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        {item.image_urls?.[0] && (
                                            <img
                                                src={item.image_urls[0]}
                                                alt={item.product_name}
                                                className="w-16 h-20 object-cover bg-brand-50"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-brand-900 text-sm">{item.product_name}</p>
                                            <p className="text-xs text-brand-400 mt-1">Adet: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-brand-900 text-sm">
                                            ₺{(item.unit_price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Toplam ve Adres */}
                        <div className="border-t border-brand-100 pt-5 flex justify-between items-end">
                            <div className="max-w-xs">
                                <p className="text-xs tracking-widest uppercase text-brand-500 mb-1">Teslimat Adresi</p>
                                <p className="text-xs text-brand-600 leading-relaxed">{result.order.shipping_address}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs tracking-widest uppercase text-brand-500 mb-1">Toplam</p>
                                <p className="text-xl font-serif font-bold text-brand-900">
                                    ₺{result.order.total_amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Yardım */}
                    <div className="text-center text-xs text-brand-400">
                        Yardıma mı ihtiyacınız var?{' '}
                        <Link href="/" className="text-brand-900 underline hover:text-brand-600">
                            Bize ulaşın
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}