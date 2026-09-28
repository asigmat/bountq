'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { useToast } from '../../context/ToastContext';

function SearchResultsContent() {
    const { notify } = useToast();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
                if (res.ok) setProducts(await res.json());
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        if (query) fetchProducts();
    }, [query]);

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

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <nav className="text-xs text-brand-400 tracking-wide mb-8">
                <Link href="/" className="hover:text-brand-900 transition">Anasayfa</Link>
                <span className="mx-2">/</span>
                <span className="text-brand-900">Arama</span>
            </nav>

            <div className="mb-10">
                <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                    Arama Sonuçları
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-900">
                    "{query}"
                </h1>
                <p className="text-brand-500 text-sm mt-3">{products.length} ürün bulundu</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse border border-gray-100">
                            <div className="aspect-[3/4] bg-gray-100" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-100 w-3/4 mx-auto" />
                                <div className="h-5 bg-gray-100 w-1/3 mx-auto" />
                                <div className="h-10 bg-gray-100 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-brand-400 text-lg mb-4">Sonuç bulunamadı.</p>
                    <Link href="/" className="text-brand-900 underline text-sm">
                        Anasayfaya Dön
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div className="py-20 text-center text-brand-400">Yükleniyor...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
