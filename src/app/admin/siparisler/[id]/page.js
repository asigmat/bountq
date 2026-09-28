'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../../context/ToastContext';

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Beklemede' },
    { value: 'PAID', label: 'Ödendi' },
    { value: 'PREPARING', label: 'Hazırlanıyor' },
    { value: 'SHIPPED', label: 'Kargoda' },
    { value: 'DELIVERED', label: 'Teslim Edildi' },
    { value: 'CANCELLED', label: 'İptal Edildi' },
];

const CARGO_COMPANIES = ['Aras', 'Yurtiçi', 'MNG', 'Sürat', 'PTT', 'UPS', 'Diğer'];

export default function AdminOrderDetailPage() {
    const { notify, confirmAction } = useToast();
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        status: 'PENDING',
        tracking_no: '',
        cargo_company: '',
        admin_note: '',
    });

    useEffect(() => {
        const fetchOrder = async () => {            const res = await fetch(`/api/admin/orders/${id}`, {
                cache: 'no-store',
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setItems(data.items);
                setForm({
                    status: data.order.status || 'PENDING',
                    tracking_no: data.order.tracking_no || '',
                    cargo_company: data.order.cargo_company || '',
                    admin_note: data.order.admin_note || '',
                });
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);        const res = await fetch(`/api/admin/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',            },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (res.ok) {
            const updated = await res.json();
            setOrder(updated);
            notify('Sipariş güncellendi.');
        } else {
            notify('Sipariş güncellenemedi.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!await confirmAction('Bu işlem geri alınamaz. Siparişi silmek istediğinizden emin misiniz?', 'Sipariş silinsin mi?')) return;
        const res = await fetch(`/api/admin/orders/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            notify('Sipariş silindi.');
            router.push('/admin/siparisler');
        } else {
            notify('Sipariş silinemedi.', 'error');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Yükleniyor...</div>;
    if (!order) return <div className="p-12 text-center text-gray-500">Sipariş bulunamadı</div>;

    const subtotal = items.reduce((s, i) => s + parseFloat(i.unit_price) * i.quantity, 0);

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/siparisler" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Sipariş <span className="font-mono">SKB{order.id.toString().padStart(6, '0')}</span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleString('tr-TR')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                    <TrashIcon className="h-4 w-4" />
                    Sil
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* SOL: Müşteri & Ürünler */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Müşteri */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                            Müşteri Bilgileri
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Ad Soyad</p>
                                <p className="font-medium">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Telefon</p>
                                <p className="font-medium">{order.customer_phone}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">E-posta</p>
                                <p className="font-medium">{order.customer_email || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Teslimat Adresi</p>
                                <p className="text-gray-700 leading-relaxed">{order.shipping_address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                            Sipariş Ürünleri ({items.length})
                        </h2>
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    {item.image_urls?.[0] && (
                                        <img
                                            src={item.image_urls[0]}
                                            alt={item.product_name}
                                            className="w-16 h-20 object-cover rounded-lg bg-gray-50"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Adet: {item.quantity} × ₺{parseFloat(item.unit_price).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        ₺{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Toplamlar */}
                        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Ara Toplam</span>
                                <span>₺{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Kargo</span>
                                <span>₺{(parseFloat(order.total_amount) - subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                                <span>Toplam</span>
                                <span>₺{parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ: İşlem Paneli */}
                <div className="space-y-6">
                    {/* Sipariş Durumu */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                            Sipariş Yönetimi
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Sipariş Durumu</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Kargo Firması</label>
                                <select
                                    value={form.cargo_company}
                                    onChange={(e) => setForm({ ...form, cargo_company: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                                >
                                    <option value="">Seçin</option>
                                    {CARGO_COMPANIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Kargo Takip No</label>
                                <input
                                    type="text"
                                    value={form.tracking_no}
                                    onChange={(e) => setForm({ ...form, tracking_no: e.target.value })}
                                    placeholder="Örn: 1234567890"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notu</label>
                                <textarea
                                    value={form.admin_note}
                                    onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
                                    rows="3"
                                    placeholder="Sadece sen görürsün..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="h-5 w-5" />
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>

                    {/* Ödeme Bilgisi */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                            Ödeme Durumu
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                    order.payment_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.payment_status === 'SUCCESS' ? 'Başarılı' :
                                    order.payment_status === 'FAILED' ? 'Başarısız' : 'Beklemede'}
                            </span>
                        </div>
                        {order.payment_transaction_id && (
                            <p className="text-xs text-gray-500 mt-3 break-all">
                                <strong>İşlem No:</strong> {order.payment_transaction_id}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
