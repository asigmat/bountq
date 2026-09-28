'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../../context/ToastContext';

export default function AdminNewProductPage() {
    const { notify } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        sizes: ['S', 'M', 'L', 'XL'],
        category_id: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch('/api/categories');
            if (res.ok) setCategories(await res.json());
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleSize = (size) => {
        const active = form.sizes.includes(size);
        setForm({
            ...form,
            sizes: active ? form.sizes.filter(s => s !== size) : [...form.sizes, size]
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        const uploadPromises = files.map(async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/admin/upload', {
                method: 'POST',                body: fd,
            });
            const data = await res.json();
            return res.ok ? data.url : null;
        });

        const results = await Promise.all(uploadPromises);
        const validUrls = results.filter(Boolean);
        setImages(prev => [...prev, ...validUrls]);

        if (validUrls.length < files.length) {
            notify(`${files.length - validUrls.length} görsel yüklenemedi.`, 'error');
        }
        setUploading(false);
        e.target.value = '';
    };

    const removeImage = (url) => setImages(images.filter(i => i !== url));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) {
            notify('Ürün eklemek için en az bir görsel yükleyin.', 'info');
            return;
        }
        if (form.sizes.length === 0) {
            notify('En az bir beden seçin.', 'info');
            return;
        }
        if (!form.category_id) {
            notify('Bir kategori seçin.', 'info');
            return;
        }
        setLoading(true);
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',            },
            body: JSON.stringify({
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                image_urls: images,
                sizes: form.sizes,
                category_id: parseInt(form.category_id),
            })
        });

        setLoading(false);
        if (res.ok) {
            notify('Ürün başarıyla eklendi.');
            router.push('/admin/urunler');
        } else {
            const data = await res.json();
            notify(data.error || 'Ürün eklenirken bir hata oluştu.', 'error');
        }
    };

    const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Yeni Ürün Ekle</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                    <select name="category_id" required value={form.category_id} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300">
                        <option value="">Kategori Seçin</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows="4"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺) *</label>
                        <input type="number" step="0.01" name="price" required value={form.price} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                        <input type="number" name="stock" required value={form.stock} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedenler *</label>
                    <div className="flex flex-wrap gap-2">
                        {allSizes.map(size => {
                            const active = form.sizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium transition ${active
                                            ? 'bg-rose-600 text-white border-rose-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-rose-400'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Seçili: {form.sizes.length > 0 ? form.sizes.join(', ') : 'Yok'}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Görselleri *</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-rose-600 file:text-white file:cursor-pointer hover:file:bg-rose-700"
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-2">Yükleniyor...</p>}
                    {images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-4">
                            {images.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={url} alt={`görsel-${idx}`} className="w-full h-24 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(url)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex space-x-3 pt-4">
                    <button type="submit" disabled={loading || uploading}
                        className="bg-rose-600 text-white px-6 py-2.5 rounded-lg hover:bg-rose-700 disabled:opacity-50 font-medium">
                        {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                    </button>
                    <button type="button" onClick={() => router.push('/admin/urunler')}
                        className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-medium">
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
}
