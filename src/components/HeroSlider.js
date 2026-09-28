'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSlider({ banner }) {
    if (!banner) return null;

    // Video mu resim mi kontrolü
    const isVideo = banner.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);

    return (
        <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                {isVideo ? (
                    <video
                        src={banner.image_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="none"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner'}
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/25" />
            </motion.div>

            {/* Yazı Ortada */}
            <div className="relative h-full flex items-center justify-center text-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 }}
                    className="max-w-3xl"
                >
                    {banner.subtitle && (
                        <p className="text-white/90 text-[10px] md:text-xs tracking-[0.4em] uppercase font-light mb-5">
                            {banner.subtitle}
                        </p>
                    )}
                    {banner.title && (
                        <h1 className="text-white font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-wide drop-shadow-2xl">
                            {banner.title}
                        </h1>
                    )}
                    {banner.button_text && (
                        <Link
                            href={banner.button_link || '#'}
                            className="inline-block bg-white text-gray-900 text-[11px] tracking-[0.25em] uppercase font-medium px-12 py-4 hover:bg-gray-100 transition shadow-2xl"
                        >
                            {banner.button_text}
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Aşağı Ok */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </motion.div>
        </section>
    );
}
