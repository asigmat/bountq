'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../context/ToastContext';

const STATUS_MAP = {
    PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
    COMPLETED: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
};

const FILTERS = [
    { value: 'all', label: 'Tümü' },
    { value: 'PENDING', label: 'Beklemede' },
    { value: 'APPROVED', label: 'Onaylandı' },
    { value: 'REJECTED', label: 'Reddedildi' },
    { value: 'COMPLETED', label: 'Tamamlandı' },
];

export default function AdminReturnsPage() {
    const { notify, confirmAction } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);        const res = await fetch(`/api/admin/returns?status=${filter}`, {
            cache: 'no-store',
        });
        if (res.ok) setRequests(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchRequests(); }, [filter]);

    const handleUpdate = async (status) => {
        if (!selected) return;
        setSaving(true);        const res = await fetch(`/api/admin/returns/${selected.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',            },
            body: JSON.stringify({ status, admin_note: adminNote }),
        });
        setSaving(false);
        if (res.ok) {
            notify('İade talebi güncellendi.');
            setSelected(null);
            setAdminNote('');
            fetchRequests();
        } else {
            notify('İade talebi güncellenemedi.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirmAction('Bu iade talebini silmek istediğinizden emin misiniz?', 'Talep silinsin mi?')) return;
        const res = await fetch(`/api/admin/returns/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            notify('İade talebi silindi.');
            fetchRequests();
        } else notify('İade talebi silinemedi.', 'error');
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">İade / Değişim Talepleri</h1>
                <p className="text-gray-500 text-sm mt-1">{requests.length} talep listeleniyor</p>
            </div>

            {/* Filtreler */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-center py-12 text-gray-500">Yükleniyor...</p>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                    Bu kategoride talep yok.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ürün</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Müşteri</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tür</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => {
                                    const st = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
                                    return (
                                        <motion.tr
                                            key={req.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4 font-mono text-xs">#{req.id}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {req.image_urls?.[0] && (
                                                        <img src={req.image_urls[0]} alt="" className="w-10 h-10 object-cover rounded" />
                                                    )}
                                                    <span className="text-sm font-medium truncate max-w-[150px]">
                                                        {req.product_name || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium">{req.customer_name || '-'}</p>
                                                <p className="text-xs text-gray-500">{req.customer_phone}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-medium">
                                                    {req.request_type === 'return' ? 'İade' : 'Değişim'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500">
                                                {new Date(req.created_at).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => { setSelected(req); setAdminNote(req.admin_note || ''); }}
                                                    className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                >
                                                    Detay
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg ml-1"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detay Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Talep Detayı #{selected.id}</h2>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Ürün</p>
                                <p className="font-medium">{selected.product_name || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Müşteri</p>
                                <p className="font-medium">{selected.customer_name}</p>
                                <p className="text-sm text-gray-600">{selected.customer_phone}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Tür</p>
                                <p className="font-medium">
                                    {selected.request_type === 'return' ? 'İade' : 'Değişim'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Sebep</p>
                                <p className="text-sm">{selected.reason}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notu</label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows="3"
                                    placeholder="Müşteriye iletilecek not..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleUpdate('APPROVED')}
                                disabled={saving}
                                className="bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                            >
                                Onayla
                            </button>
                            <button
                                onClick={() => handleUpdate('REJECTED')}
                                disabled={saving}
                                className="bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                            >
                                Reddet
                            </button>
                            <button
                                onClick={() => handleUpdate('COMPLETED')}
                                disabled={saving}
                                className="col-span-2 bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
                            >
                                Tamamlandı İşaretle
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
