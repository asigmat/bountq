'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const STATUS_MAP = {
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Ödendi', color: 'bg-green-100 text-green-800' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
};

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'PAID', label: 'Ödendi' },
  { value: 'PREPARING', label: 'Hazırlanıyor' },
  { value: 'SHIPPED', label: 'Kargoda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'CANCELLED', label: 'İptal' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);    try {
      const url = `/api/admin/orders?status=${filter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {        cache: 'no-store',
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [filter, search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Siparişler</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} sipariş listeleniyor</p>
      </div>

      {/* Filtreler ve Arama */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-4">
        <div className="flex flex-wrap gap-2">
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

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, telefon veya sipariş no ile ara..."
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-center py-12 text-gray-500">Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          Sipariş bulunamadı.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sipariş No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-900">
                        SKB{order.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                        ₺{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.item_count} ürün
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/siparisler/${order.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Detay
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}