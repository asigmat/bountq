'use client';
import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WhatsAppButton from '../components/WhatsAppButton';
import SearchPanel from '../components/SearchPanel';
import {
  ShoppingBagIcon, MagnifyingGlassIcon, XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CartProvider, useCart } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';

function Header() {
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileOpen ? 'hidden' : '';
  }, [searchOpen, mobileOpen]);

  const transparent = isHome && !scrolled;

  const navLinks = [
    { href: '/', label: 'Anasayfa' },
    { href: '#', label: 'Yeni Gelenler' },
    { href: '#', label: 'Elbise' },
    { href: '#', label: 'Üst Giyim' },
    { href: '#', label: 'Alt Giyim' },
    { href: '#', label: 'Aksesuar' },
    { href: '/siparis-takip', label: 'Sipariş Takip' },
    { href: '#', label: 'İndirim', highlight: true },
  ];

  const secondaryLinks = [
    { href: '#', label: 'Hakkımızda' },
    { href: '#', label: 'İletişim' },
    { href: '#', label: 'Kargo & İade' },
    { href: '#', label: 'S.S.S.' },
  ];

  return (
    <>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${transparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
        }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20 md:h-24'
            }`}>
            {/* SOL: Hamburger + Logo */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => setMobileOpen(true)}
                className={`group p-2 -ml-2 rounded-full transition-all duration-300 ${transparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-brand-900 hover:bg-brand-50'
                  }`}
                aria-label="Menüyü Aç"
              >
                <div className="flex flex-col gap-[5px] w-6">
                  <span className={`h-[1.5px] w-full transition-all duration-300 ${transparent ? 'bg-white' : 'bg-brand-900'} group-hover:w-4`} />
                  <span className={`h-[1.5px] w-full transition-all duration-300 ${transparent ? 'bg-white' : 'bg-brand-900'}`} />
                  <span className={`h-[1.5px] w-4 transition-all duration-300 ${transparent ? 'bg-white' : 'bg-brand-900'} group-hover:w-full`} />
                </div>
              </button>

              {/* Logo + SK Boutique */}
              <Link href="/" className="group flex items-center gap-3">

                <div className="flex flex-col leading-none">
                  <span className={`text-base md:text-lg font-serif font-bold tracking-[0.15em] transition-colors ${transparent ? 'text-white' : 'text-brand-900'}`}>
                    SK
                  </span>
                  <span className={`text-[8px] tracking-[0.3em] font-light mt-0.5 uppercase transition-colors ${transparent ? 'text-white/70' : 'text-brand-400'}`}>
                    Boutique
                  </span>
                </div>
              </Link>
            </div>

            {/* ORTA: Masaüstü Kısa Menü */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors group ${transparent
                    ? 'text-white hover:text-white/80'
                    : 'text-brand-700 hover:text-brand-900'
                    }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-0 group-hover:w-6 transition-all duration-300 ${transparent ? 'bg-white' : 'bg-brand-900'
                    }`} />
                </Link>
              ))}
            </nav>

            {/* SAĞ: İkonlar */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2.5 rounded-full transition ${transparent ? 'text-white hover:bg-white/10' : 'text-brand-700 hover:text-brand-900 hover:bg-brand-50'}`}
                title="Ara"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <Link href="/sepet" className={`relative p-2.5 rounded-full transition ${transparent ? 'text-white hover:bg-white/10' : 'text-brand-700 hover:text-brand-900 hover:bg-brand-50'}`} title="Sepetim">
                <ShoppingBagIcon className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className={`absolute top-1 right-1 text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-semibold ring-2 ${transparent
                    ? 'bg-white text-brand-900 ring-black/20'
                    : 'bg-brand-900 text-white ring-white'
                    }`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HAMBURGER MENÜ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute left-0 top-0 bottom-0 w-full sm:w-[420px] md:w-[480px] bg-white shadow-2xl flex flex-col animate-[slideRight_0.4s_cubic-bezier(0.25,0.46,0.45,0.94)]">

            <div className="flex items-center justify-between px-8 py-7 border-b border-gray-100">
              {/* Hamburger Menüdeki Logo */}
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="SK Boutique"
                  className="h-12 w-auto object-contain rounded-sm"
                />
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-serif font-bold tracking-[0.15em] text-brand-900">SK</span>
                  <span className="text-[8px] tracking-[0.3em] text-brand-400 font-light mt-1 uppercase">Boutique</span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-brand-900 transition"
                aria-label="Menüyü Kapat"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-8">

              <div className="mb-10">
                <p className="text-[10px] tracking-[0.4em] uppercase text-brand-400 font-medium mb-5">
                  Kategoriler
                </p>
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center justify-between py-3 text-2xl md:text-3xl font-serif font-medium text-brand-900 hover:text-brand-600 transition-colors"
                      >
                        <span className={link.highlight ? 'text-rose-600' : ''}>
                          {link.label}
                        </span>
                        <ArrowRightIcon className="h-5 w-5 text-brand-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-gray-100 mb-10">
                <ul className="space-y-3">
                  {secondaryLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-brand-500 hover:text-brand-900 transition-colors tracking-wide"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-gray-100 space-y-3">
                <Link href="/sepet" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm text-brand-700 hover:text-brand-900 transition w-full">
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span className="tracking-wide">Sepetim ({cartCount})</span>
                </Link>
              </div>
            </nav>

            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] tracking-[0.4em] uppercase text-brand-400 font-medium mb-4">
                Bizi Takip Edin
              </p>
              <div className="flex items-center gap-5 text-sm text-brand-700">
                <a href="#" className="hover:text-brand-900 transition tracking-wide">Instagram</a>
                <a href="#" className="hover:text-brand-900 transition tracking-wide">TikTok</a>
                <a href="#" className="hover:text-brand-900 transition tracking-wide">Pinterest</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arama Paneli */}
      {/* Arama Paneli */}
      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">

      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-brand-900 antialiased">
        <ToastProvider>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <WhatsAppButton />
          <footer className="bg-brand-900 text-brand-100 mt-20">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid md:grid-cols-4 gap-10">
                <div>
                  {/* Footer Logosu */}
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src="/logo.jpg"
                      alt="SK Boutique"
                      className="h-12 w-auto object-contain rounded-sm bg-white p-1"
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-lg font-serif font-bold tracking-[0.15em] text-white">SK</span>
                      <span className="text-[8px] tracking-[0.3em] text-brand-400 font-light mt-1 uppercase">Boutique</span>
                    </div>
                  </div>
                  <p className="text-brand-300 text-sm leading-relaxed">
                    Zamansız tasarımlar ve özenle seçilmiş kumaşlarla zahmetsiz şıklığın adresi.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-brand-300">Alışveriş</h4>
                  <ul className="space-y-3 text-brand-200 text-sm">
                    <li><Link href="#" className="hover:text-white transition">Yeni Gelenler</Link></li>
                    <li><Link href="#" className="hover:text-white transition">Elbise</Link></li>
                    <li><Link href="#" className="hover:text-white transition">Üst Giyim</Link></li>
                    <li><Link href="#" className="hover:text-white transition">Alt Giyim</Link></li>
                    <li><Link href="#" className="hover:text-white transition">Aksesuar</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-brand-300">Yardım</h4>
                  <ul className="space-y-3 text-brand-200 text-sm">
                    <li><Link href="#" className="hover:text-white transition">Kargo Takip</Link></li>
                    <li><Link href="#" className="hover:text-white transition">İade ve Değişim</Link></li>
                    <li><Link href="#" className="hover:text-white transition">Sıkça Sorulan Sorular</Link></li>
                    <li><Link href="#" className="hover:text-white transition">İletişim</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-brand-300">Bülten</h4>
                  <p className="text-brand-300 text-sm mb-4">Yeni ürünler ve kampanyalardan ilk siz haberdar olun.</p>
                  <div className="flex">
                    <input type="email" placeholder="E-posta adresiniz"
                      className="flex-1 bg-brand-800 border border-brand-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-500" />
                    <button className="bg-white text-brand-900 text-sm font-medium px-5 py-3 hover:bg-brand-100 transition">
                      Katıl
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-brand-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-brand-400 text-xs">
                <p>© 2026 SK Boutique. Tüm hakları saklıdır.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white transition">Kullanım Şartları</a>
                  <a href="#" className="hover:text-white transition">Gizlilik Politikası</a>
                  <a href="#" className="hover:text-white transition">KVKK</a>
                </div>
              </div>
            </div>
          </footer>
        </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
