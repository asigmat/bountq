'use client';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product, onAddToCart }) {
    const imageUrl = product.image_urls?.[0] || '/placeholder.jpg';
    const price = parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
    return (
        <div className="group border border-gray-200 bg-white hover:border-gray-400 transition-colors duration-300">
            {/* Görsel Alanı */}
            <div className="relative overflow-hidden bg-gray-50">
                <Link href={`/urun/${product.id}`}>
                    <div className="aspect-[3/4] overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </Link>
                {/* Favori Butonu */}
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                    <HeartIcon className="h-4 w-4 text-gray-600" />
                </button>
                {/* Yeni Etiketi */}
                <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] tracking-widest uppercase px-3 py-1.5">
                    Yeni
                </span>
            </div>

            {/* Bilgi Alanı */}
            <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-gray-800 mb-2 truncate">
                    {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-1">
                    ₺{price}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                    {sizes.length} Beden
                </p>

                {/* Sepete Ekle Butonu - Tam Genişlik, İnce Çerçeve */}
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full border border-gray-900 text-gray-900 text-xs tracking-[0.2em] uppercase font-medium py-3 hover:bg-gray-900 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
            </div>
        </div>
    );
}
