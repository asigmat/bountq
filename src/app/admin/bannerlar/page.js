'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../context/ToastContext';

export default function AdminBannersPage() {
    const { notify, confirmAction } = useToast();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '', subtitle: '', description: '', image_url: '', button_text: '', button_link: '',
        type: 'hero', sort_order: 0, is_active: true,
    });
    const fetchBanners = async () => {
        const res = await fetch('/api/admin/banners', {
        });
        if (res.ok) setBanners(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: fd,
        });
        const data = await res.json();
        if (res.ok) setForm(prev => ({ ...prev, image_url: data.url }));
        setUploading(false);
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editing ? `/api/admin/banners/${editing}` : '/api/admin/banners';
        const method = editing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            notify(editing ? 'Banner güncellendi.' : 'Banner eklendi.');
            setShowForm(false);
            setEditing(null);
            setForm({ title: '', subtitle: '', image_url: '', button_text: '', button_link: '', type: 'hero', sort_order: 0, is_active: true });
            fetchBanners();
        } else {
            notify('Banner kaydedilemedi.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirmAction('Bu bannerı silmek istediğinizden emin misiniz?', 'Banner silinsin mi?')) return;
        const res = await fetch(`/api/admin/banners/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            notify('Banner silindi.');
            fetchBanners();
        } else notify('Banner silinemedi.', 'error');
    };

    const handleEdit = (banner) => {
        setForm(banner);
        setEditing(banner.id);
        setShowForm(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Bannerlar</h1>
                    <p className="text-gray-500 text-sm mt-1">Hero slider ve kampanya görsellerini yönet</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditing(null); }}
                    className="bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" /> Yeni Banner
                </button>
            </div>

            {loading ? <p>Yükleniyor...</p> : banners.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Henüz banner eklenmemiş.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banners.map((b) => (
                        <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <img src={b.image_url} alt={b.title} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="font-semibold">{b.title || 'Başlıksız'}</p>
                                <p className="text-xs text-gray-500 mb-1">{b.type === 'hero' ? 'Hero' : 'Kampanya'} · Sıra: {b.sort_order}</p>
                                <p className={`text-xs mb-3 ${b.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                    {b.is_active ? 'Aktif' : 'Pasif'}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editing ? 'Banner Düzenle' : 'Yeni Banner'}</h2>
                            <button onClick={() => { setShowForm(false); setEditing(null); }}>
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Başlık</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alt Başlık</label>
                                <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2" />
                                <div>
                                    <label className="block text-sm font-medium mb-1">Açıklama</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="2"
                                        className="w-full border rounded-lg px-3 py-2" placeholder="Kısa açıklama..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Görsel veya Video</label>
                                <input type="file" accept="image/*,video/*" onChange={handleFileUpload}
                                    className="w-full border rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-rose-600 file:text-white" />
                                {uploading && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                                {form.image_url && (
                                    <>
                                        {form.image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                            <video src={form.image_url} className="mt-2 w-full h-40 object-cover rounded-lg" controls muted />
                                        ) : (
                                            <img src={form.image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                        )}
                                    </>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Video için bilgisayarında bir mp4 dosyası varsa, önce onu bir yere yükle (Cloudinary, kendi sunucun vs.) ve URL'sini <strong>"Görsel URL"</strong> alanına manuel yapıştır.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Buton Yazısı</label>
                                    <input type="text" value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2" placeholder="Alışverişe Başla" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Buton Linki</label>
                                    <input type="text" value={form.button_link} onChange={e => setForm({ ...form, button_link: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2" placeholder="/urunler" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tip</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2">
                                        <option value="hero">Hero Grid</option>
                                        <option value="kategori">Kategori Vitrini</option>
                                        <option value="promo">Kampanya Banner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sıra</label>
                                    <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full border rounded-lg px-3 py-2" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                <span className="text-sm">Aktif</span>
                            </label>
                            <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 font-medium">
                                {editing ? 'Güncelle' : 'Ekle'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
