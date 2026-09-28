'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function SearchPanel({ isOpen, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Açıldığında input'a focus
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // ESC ile kapat
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Canlı arama (debounce)
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) setResults(await res.json());
            } catch (err) { console.error(err); }
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    // Enter veya "Ara" butonuna basınca tüm sonuçlar sayfasına git
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/arama?q=${encodeURIComponent(query)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Yarı saydam overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
                onClick={onClose}
            />

            {/* Üstten inen arama barı */}
            <div className="fixed top-0 left-0 right-0 z-[71] bg-white shadow-2xl animate-[slideDown_0.3s_ease-out]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Üst satır: başlık + kapat */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-medium">
                            Ürün Ara
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-900 transition"
                            aria-label="Kapat"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Arama input satırı */}
                    <form onSubmit={handleSubmit} className="py-5">
                        <div className="relative flex items-center gap-4">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Elbise, ceket, çanta..."
                                className="flex-1 text-2xl md:text-3xl font-light text-gray-900 placeholder-gray-300 focus:outline-none py-2 bg-transparent"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="p-2 text-gray-400 hover:text-gray-900 transition"
                                    aria-label="Temizle"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!query.trim()}
                                className="hidden md:inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-gray-800 transition disabled:opacity-30"
                            >
                                Ara <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Alt içerik: sonuçlar / popüler */}
                    <div className="pb-6 max-h-[55vh] overflow-y-auto">
                        {/* Popüler (sorgu yoksa) */}
                        {query.trim().length < 2 && (
                            <div className="py-4">
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-4">
                                    Popüler Aramalar
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['Elbise', 'Blazer', 'Çanta', 'Topuklu', 'Triko', 'Gömlek'].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setQuery(tag)}
                                            className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yükleniyor */}
                        {loading && query.trim().length >= 2 && (
                            <p className="py-6 text-sm text-gray-400 text-center">Aranıyor...</p>
                        )}

                        {/* Sonuç yok */}
                        {!loading && query.trim().length >= 2 && results.length === 0 && (
                            <div className="py-6 text-center">
                                <p className="text-sm text-gray-500">"{query}" için sonuç bulunamadı.</p>
                                <button
                                    onClick={handleSubmit}
                                    className="text-xs text-gray-900 underline mt-2 hover:opacity-70"
                                >
                                    Yine de tüm sonuçları ara →
                                </button>
                            </div>
                        )}

                        {/* Sonuçlar */}
                        {!loading && results.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400">
                                        Ürünler ({results.length})
                                    </p>
                                    <button
                                        onClick={handleSubmit}
                                        className="text-xs text-gray-900 underline hover:opacity-70"
                                    >
                                        Tümünü Gör →
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {results.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/urun/${item.id}`}
                                            onClick={onClose}
                                            className="group block"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-3">
                                                <img
                                                    src={item.image_urls?.[0] || '/placeholder.jpg'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 truncate group-hover:opacity-70">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ₺{parseFloat(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}