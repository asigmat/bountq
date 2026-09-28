'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../context/ToastContext';

export default function AdminCouponsPage() {
    const { notify, confirmAction } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        code: '',
        discount_type: 'percent',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true,
    });
    const fetchCoupons = async () => {
        const res = await fetch('/api/admin/coupons', {
            cache: 'no-store',
        });
        if (res.ok) setCoupons(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editing ? `/api/admin/coupons/${editing}` : '/api/admin/coupons';
        const method = editing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            notify(editing ? 'Kupon güncellendi.' : 'Kupon eklendi.');
            closeForm();
            fetchCoupons();
        } else {
            const err = await res.json();
            notify(err.error || 'Kupon kaydedilemedi.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirmAction('Bu kuponu silmek istediğinizden emin misiniz?', 'Kupon silinsin mi?')) return;
        const res = await fetch(`/api/admin/coupons/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            notify('Kupon silindi.');
            fetchCoupons();
        } else notify('Kupon silinemedi.', 'error');
    };

    const handleEdit = (coupon) => {
        setForm({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_amount: coupon.min_order_amount || '',
            usage_limit: coupon.usage_limit || '',
            expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
            is_active: coupon.is_active,
        });
        setEditing(coupon.id);
        setShowForm(true);
    };

    const closeForm = () => {
        setForm({
            code: '',
            discount_type: 'percent',
            discount_value: '',
            min_order_amount: '',
            usage_limit: '',
            expires_at: '',
            is_active: true,
        });
        setEditing(null);
        setShowForm(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Kuponlar</h1>
                    <p className="text-gray-500 text-sm mt-1">{coupons.length} kupon listeleniyor</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditing(null); }}
                    className="bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" /> Yeni Kupon
                </button>
            </div>

            {loading ? (
                <p className="text-center py-12 text-gray-500">Yükleniyor...</p>
            ) : coupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                    Henüz kupon oluşturulmamış.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kod</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">İndirim</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min. Tutar</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kullanım</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Son Tarih</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(c => (
                                    <motion.tr
                                        key={c.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <span className="font-mono font-bold text-sm">{c.code}</span>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {c.discount_type === 'percent'
                                                ? `%${parseFloat(c.discount_value)}`
                                                : `₺${parseFloat(c.discount_value).toFixed(2)}`}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            ₺{parseFloat(c.min_order_amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {c.used_count} / {c.usage_limit || '∞'}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-500">
                                            {c.expires_at
                                                ? new Date(c.expires_at).toLocaleDateString('tr-TR')
                                                : 'Süresiz'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {c.is_active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editing ? 'Kupon Düzenle' : 'Yeni Kupon'}</h2>
                            <button onClick={closeForm}>
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Kupon Kodu *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="Örn: HOSGELDIN10"
                                    className="w-full border rounded-lg px-3 py-2 font-mono uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">İndirim Tipi</label>
                                    <select
                                        value={form.discount_type}
                                        onChange={e => setForm({ ...form, discount_type: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="percent">Yüzde (%)</option>
                                        <option value="fixed">Sabit (₺)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">İndirim Değeri *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.discount_value}
                                        onChange={e => setForm({ ...form, discount_value: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Minimum Sepet Tutarı (₺)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.min_order_amount}
                                    onChange={e => setForm({ ...form, min_order_amount: e.target.value })}
                                    placeholder="0"
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kullanım Limiti</label>
                                    <input
                                        type="number"
                                        value={form.usage_limit}
                                        onChange={e => setForm({ ...form, usage_limit: e.target.value })}
                                        placeholder="Sınırsız için boş"
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Son Kullanım Tarihi</label>
                                    <input
                                        type="date"
                                        value={form.expires_at}
                                        onChange={e => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                />
                                <span className="text-sm">Aktif</span>
                            </label>

                            <button
                                type="submit"
                                className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 font-medium"
                            >
                                {editing ? 'Güncelle' : 'Kupon Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
