'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, ClipboardDocumentListIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

    useEffect(() => {
        const fetchStats = async () => {            try {
                const res = await fetch('/api/admin/stats', {                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Toplam Ürün', value: stats.products, icon: ShoppingBagIcon, color: 'bg-rose-500' },
        { label: 'Toplam Sipariş', value: stats.orders, icon: ClipboardDocumentListIcon, color: 'bg-blue-500' },
        { label: 'Toplam Gelir', value: `₺${stats.revenue.toFixed(2)}`, icon: BanknotesIcon, color: 'bg-green-500' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Hoş Geldin 👋</h1>
            <p className="text-gray-600 mb-8">Bugün mağazan nasıl gidiyor?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                                </div>
                                <div className={`${card.color} p-4 rounded-xl`}>
                                    <Icon className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
                <div className="flex flex-wrap gap-3">
                    <a href="/admin/urunler/yeni" className="bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700">
                        + Yeni Ürün Ekle
                    </a>
                    <a href="/admin/siparisler" className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900">
                        Siparişleri Gör
                    </a>
                </div>
            </div>
        </div>
    );
}