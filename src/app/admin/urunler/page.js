'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../context/ToastContext';

export default function AdminProductsPage() {
    const { notify, confirmAction } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {        const res = await fetch('/api/admin/products', {            cache: 'no-store',  // ← EKLE
        });
        if (res.ok) {
            const data = await res.json();
            setProducts(data);
        }
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id) => {
        if (!await confirmAction('Bu ürünü silmek istediğinizden emin misiniz?', 'Ürün silinsin mi?')) return;
        const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',            cache: 'no-store',  // ← EKLE
        });
        if (res.ok) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            const data = await res.json();
            notify(data.error || 'Ürün silinemedi.', 'error');
        }
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Ürünler</h1>
                    <p className="text-gray-500 text-sm mt-1">{products.length} ürün listeleniyor</p>
                </div>
                <Link
                    href="/admin/urunler/yeni"
                    className="bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 font-medium shadow-sm"
                >
                    + Yeni Ürün
                </Link>
            </div>

            {loading ? (
                <p className="text-center py-12 text-gray-500">Yükleniyor...</p>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500 mb-4">Henüz ürün eklenmemiş.</p>
                    <Link href="/admin/urunler/yeni" className="text-rose-600 font-medium hover:underline">
                        İlk ürününü ekle →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ürün</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fiyat</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stok</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {products.map((product) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {product.image_urls?.[0] && (
                                                    <img
                                                        src={product.image_urls[0]}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">₺{parseFloat(product.price).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 5 ? 'bg-green-100 text-green-700' :
                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock} adet
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/urunler/${product.id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="inline-block p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
