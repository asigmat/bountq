'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CategoryBanners({ banners }) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="w-full">
      {/* ═══ 3'LÜ KATEGORİ BANNER (Birleşik, çerçeveli) ═══ */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="relative overflow-hidden group"
            >
              <Link href={banner.button_link || '#'} className="block">
                <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title || `Kategori ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-500" />
                </div>

                <div className="absolute top-20 md:top-28 left-0 right-0 text-center px-4">
                  {banner.title && (
                    <h3 className="text-white font-serif text-2xl md:text-4xl tracking-[0.15em] font-semibold mb-2 drop-shadow-lg">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-white/85 text-[10px] md:text-xs tracking-[0.3em] uppercase font-light drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ KAHVERENGİ ÖZELLİKLER BARI (TAM GENİŞLİK) ═══ */}
      <div className="bg-[#3d2f25] text-white mt-8 md:mt-12 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: '3000₺ ve Üzeri',
                desc: 'Ücretsiz Kargo',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
              },
              {
                title: 'Güvenli Alışveriş',
                desc: '256 Bit SSL ile korunan ödeme altyapısı',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: 'Memnuniyet Odaklı Hizmet',
                desc: 'Tüm Süreçlerde Profesyonel Destek',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
              },
              {
                title: 'Kolay İade & Değişim',
                desc: '14 gün İçinde Hızlı ve Kolay İade',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 text-white/90">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-semibold leading-tight">{item.title}</p>
                  <p className="text-[10px] md:text-xs text-white/70 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
