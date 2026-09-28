'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import CategoryBanners from '../components/CategoryBanners';
import CategoryProducts from '../components/CategoryProducts';
import HeroSlider from '../components/HeroSlider';
import { useToast } from '../context/ToastContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function HomePage() {
  const { notify } = useToast();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, bannerRes, catRes] = await Promise.all([
          fetch('/api/products?limit=8'),
          fetch('/api/banners'),
          fetch('/api/categories'),
        ]);
        if (prodRes.ok) setProducts(await prodRes.json());
        if (bannerRes.ok) setBanners(await bannerRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

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

  const sortedBanners = [...banners].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const heroBanner = sortedBanners.length > 0 ? sortedBanners[0] : null;
  const categoryBanners = sortedBanners.slice(1, 4);

  return (
    <div>
      {/* HERO BANNER */}
      {heroBanner && <HeroSlider banner={heroBanner} />}

      {/* 3'LÜ KATEGORİ VİTRİNİ */}
      {categoryBanners.length > 0 && (
        <CategoryBanners banners={categoryBanners} />
      )}

      {/* ÖNE ÇIKAN ÜRÜNLER */}
      <section id="urunler" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div className="flex justify-between items-end mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">Seçili Parçalar</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900">Öne Çıkan Ürünler</h2>
          </div>
          <Link href="#" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900 transition">
            Tümünü Gör <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-100">
                <div className="aspect-[3/4] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 w-3/4 mx-auto" />
                  <div className="h-5 bg-gray-100 w-1/3 mx-auto" />
                  <div className="h-3 bg-gray-100 w-1/4 mx-auto" />
                  <div className="h-10 bg-gray-100 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-20 text-brand-400">Henüz ürün eklenmemiş.</p>
        ) : (
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} onAddToCart={addToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* KATEGORİ BAZLI ÜRÜNLER */}
      {categories.map((cat) => (
        <CategoryProducts key={cat.id} category={cat} onAddToCart={addToCart} />
      ))}
    </div>
  );
}
