'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';

export default function CategoryProducts({ category, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shouldFetch, setShouldFetch] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const element = sectionRef.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldFetch(true);
                observer.disconnect();
            }
        }, { rootMargin: '300px' });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!shouldFetch) return;
        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/products?category=${encodeURIComponent(category.slug)}&limit=4`);
                if (res.ok) setProducts(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category.slug, shouldFetch]);

    if (!shouldFetch) return <div ref={sectionRef} className="h-px" aria-hidden="true" />;
    if (loading || products.length === 0) return null;

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-t border-gray-100">
            <motion.div
                className="flex justify-between items-end mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div>
                    <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                        Koleksiyon
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900">
                        {category.name}
                    </h2>
                </div>
                <Link
                    href={`/kategori/${category.slug}`}
                    className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900 transition"
                >
                    Daha Fazlasını Gör <ArrowRightIcon className="h-4 w-4" />
                </Link>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                        }}
                    >
                        <ProductCard product={product} onAddToCart={onAddToCart} />
                    </motion.div>
                ))}
            </motion.div>

            <div className="md:hidden mt-8 text-center">
                <Link
                    href={`/kategori/${category.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-900 border-b border-brand-900 pb-1"
                >
                    Daha Fazlasını Gör <ArrowRightIcon className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}
