'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProductCard from '../../../components/ProductCard';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../context/ToastContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function Accordion({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 py-5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="text-xs tracking-[0.2em] uppercase text-gray-900 font-medium">
                    {title}
                </span>
                <ChevronDownIcon
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && <div className="mt-5">{children}</div>}
        </div>
    );
}

export default function CategoryPage() {
    const { notify } = useToast();
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        min_price: '',
        max_price: '',
        size: '',
        sort: 'price_asc',
    });

    // Kategori bilgisini çek
    useEffect(() => {
        const fetchCategory = async () => {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const cats = await res.json();
                setCategory(cats.find(c => c.slug === slug));
            }
        };
        fetchCategory();
    }, [slug]);

    // Ürünleri çek — her filtre değiştiğinde
    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                // URL parametrelerini sadece dolu olanlarla oluştur
                const params = new URLSearchParams();
                params.set('category', slug);
                if (filters.min_price) params.set('min_price', filters.min_price);
                if (filters.max_price) params.set('max_price', filters.max_price);
                if (filters.size) params.set('size', filters.size);
                if (filters.sort) params.set('sort', filters.sort);

                const url = `/api/products?${params.toString()}`;
                const res = await fetch(url);
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error('FETCH ERROR:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();

        return () => { cancelled = true; };
    }, [slug, filters.min_price, filters.max_price, filters.size, filters.sort]);

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const img = product.image_urls?.[0] || '/placeholder.jpg';
        const existing = cart.find(item => item.id === product.id);
        if (existing) existing.quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: parseFloat(product.price), image: img, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        notify(`${product.name} sepete eklendi.`);
    };

    const clearFilters = () => {
        setFilters({ min_price: '', max_price: '', size: '', sort: 'price_asc' });
    };

    const activeFilterCount = [filters.min_price, filters.max_price, filters.size].filter(Boolean).length;

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <nav className="text-xs text-gray-400 tracking-wide mb-8">
                <span>Anasayfa</span> <span className="mx-2">/</span>
                <span className="text-gray-900">{category?.name || slug}</span>
            </nav>

            <div className="mb-10 md:mb-14 flex justify-between items-end">
                <div>
                    <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-gray-500 mb-3 block">
                        Koleksiyon
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                        {category?.name || slug}
                    </h1>
                    <p className="text-gray-500 text-sm mt-3">{products.length} ürün</p>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 text-xs uppercase tracking-wider"
                >
                    Filtrele {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-10">
                <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                    <div className="lg:sticky lg:top-24">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                            <h2 className="text-xs tracking-[0.3em] uppercase text-gray-900 font-medium">
                                Filtreler
                            </h2>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">
                                    Temizle ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        <Accordion title="Sıralama">
                            <div className="space-y-3">
                                {[
                                    { value: 'price_asc', label: 'Fiyat: Artan' },
                                    { value: 'price_desc', label: 'Fiyat: Azalan' },
                                ].map(opt => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${filters.sort === opt.value ? 'border-gray-900' : 'border-gray-300 group-hover:border-gray-500'
                                            }`}>
                                            {filters.sort === opt.value && (
                                                <span className="w-2 h-2 rounded-full bg-gray-900" />
                                            )}
                                        </span>
                                        <input
                                            type="radio"
                                            name="sort"
                                            value={opt.value}
                                            checked={filters.sort === opt.value}
                                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </Accordion>

                        <Accordion title="Fiyat Aralığı">
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_price}
                                        onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition"
                                    />
                                    <span className="absolute right-3 top-3 text-xs text-gray-400 pointer-events-none">₺</span>
                                </div>
                                <span className="text-gray-300">—</span>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_price}
                                        onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition"
                                    />
                                    <span className="absolute right-3 top-3 text-xs text-gray-400 pointer-events-none">₺</span>
                                </div>
                            </div>
                        </Accordion>

                        <Accordion title="Beden">
                            <div className="grid grid-cols-3 gap-2">
                                {SIZES.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFilters({
                                            ...filters,
                                            size: filters.size === s ? '' : s
                                        })}
                                        className={`h-10 text-xs font-medium border transition ${filters.size === s
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </Accordion>

                        {showFilters && (
                            <button
                                onClick={() => setShowFilters(false)}
                                className="lg:hidden w-full bg-gray-900 text-white py-3 text-xs uppercase tracking-wider mt-4"
                            >
                                Filtreleri Uygula
                            </button>
                        )}
                    </div>
                </aside>

                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-[3/4] bg-gray-100" />
                                    <div className="mt-3 space-y-2">
                                        <div className="h-4 bg-gray-100 w-3/4" />
                                        <div className="h-4 bg-gray-100 w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg mb-4">Bu filtrelerle ürün bulunamadı.</p>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-gray-900 underline text-sm">
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
