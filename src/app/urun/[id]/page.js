'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon, ChevronDownIcon, TruckIcon, ArrowPathIcon,
  ShieldCheckIcon, MinusIcon, PlusIcon,
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon,
  MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../../../components/ProductCard';
import { useToast } from '../../../context/ToastContext';

export default function ProductDetailPage() {
  const { notify } = useToast();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState('desc');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
          if (data.category_id) {
            const relRes = await fetch(`/api/products?category_id=${data.category_id}&limit=5`);
            if (relRes.ok) {
              const rel = await relRes.json();
              setRelatedProducts(rel.filter(p => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Klavye kontrolleri (lightbox açıkken)
  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, selectedImage, product]);

  // Lightbox açıldığında scroll'u kilitle
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const images = product?.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : ['/placeholder.jpg'];

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  const openLightbox = (idx) => {
    setSelectedImage(idx);
    setLightboxOpen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 3));
  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(z - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  // Mouse drag (zoom'da resmi kaydırma)
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch swipe (kaydırma)
  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Sadece yatay swipe (dikey kaydırmadan ayırt et)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
      if (deltaX < 0) nextImage();
      else prevImage();
    }
    touchStart.current = null;
  };

  const addToCart = (goToCheckout = false) => {
    if (!selectedSize) {
      notify('Sepete eklemeden önce beden seçin.', 'info');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const img = product.image_urls?.[0] || '/placeholder.jpg';
    const existing = cart.find(item => item.id === product.id && item.size === selectedSize);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: img,
        quantity,
        size: selectedSize,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));

    if (goToCheckout) {
      window.location.href = '/odeme';
    } else {
      notify(`${quantity} adet ${product.name} (${selectedSize}) sepete eklendi.`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 animate-pulse">
          <div className="aspect-[3/4] bg-gray-100" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 w-1/3" />
            <div className="h-10 bg-gray-100 w-3/4" />
            <div className="h-8 bg-gray-100 w-1/4" />
            <div className="h-20 bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-32 text-center">
        <p className="text-brand-400 text-lg mb-4">Ürün bulunamadı</p>
        <Link href="/" className="text-brand-900 underline">Anasayfaya dön</Link>
      </div>
    );
  }

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];

  const accordions = [
    { key: 'desc', title: 'Ürün Açıklaması', content: product.description || 'Ürün açıklaması bulunmuyor.' },
    { key: 'shipping', title: 'Kargo ve İade', content: 'Ortalama teslimat süremiz 1-3 iş günüdür.\n\n2500 TL ve üzeri siparişlerinizde KARGO ÜCRETSİZDİR.\n\n14 gün içerisinde koşulsuz iade edebilirsiniz.' },
  ];

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-brand-400 tracking-wide mb-8">
          <Link href="/" className="hover:text-brand-900 transition">Anasayfa</Link>
          <span className="mx-2">/</span>
          {product.category_slug && (
            <>
              <Link href={`/kategori/${product.category_slug}`} className="hover:text-brand-900 transition">
                {product.category_name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-brand-900">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* ═══ SOL: GÖRSEL GALERİ ═══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            {/* Ana Görsel */}
            <div
              className="relative aspect-[3/4] overflow-hidden bg-brand-50 mb-3 group cursor-zoom-in select-none"
              onClick={() => openLightbox(selectedImage)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Sol/Sağ Oklar */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                    aria-label="Önceki resim"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-900" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                    aria-label="Sonraki resim"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-900" />
                  </button>
                </>
              )}

              {/* Sayfa Göstergesi */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Zoom İkonu */}
              <div className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition">
                <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
              </div>
            </div>

            {/* Thumbnail'lar */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square overflow-hidden border-2 transition ${selectedImage === i
                        ? 'border-brand-900'
                        : 'border-transparent hover:border-brand-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ═══ SAĞ: BİLGİLER ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {product.category_name && (
              <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                {product.category_name}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-semibold text-brand-900">
                ₺{parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
              {product.stock > 0 ? (
                <span className="text-xs tracking-wide text-green-600 font-medium">● Stokta</span>
              ) : (
                <span className="text-xs tracking-wide text-red-500 font-medium">● Tükendi</span>
              )}
            </div>

            {product.description && (
              <p className="text-brand-600 text-sm leading-relaxed mb-8 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Beden */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs tracking-widest uppercase text-brand-500 font-medium">Beden</span>
                <button className="text-xs text-brand-500 underline">Beden Tablosu</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 text-sm border transition ${selectedSize === size
                        ? 'bg-brand-900 text-white border-brand-900'
                        : 'bg-white text-brand-700 border-brand-200 hover:border-brand-900'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Adet + Butonlar */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-3">
                <div className="flex items-center border border-brand-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-brand-500 hover:text-brand-900 transition"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-brand-500 hover:text-brand-900 transition"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart(false)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-white border border-brand-900 text-brand-900 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-50 transition disabled:opacity-40"
                >
                  Sepete Ekle
                </button>
                <button className="w-12 h-12 border border-brand-200 flex items-center justify-center text-brand-500 hover:text-brand-900 hover:border-brand-900 transition">
                  <HeartIcon className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => addToCart(true)}
                disabled={product.stock <= 0}
                className="w-full bg-brand-900 text-white text-xs tracking-[0.2em] uppercase font-medium py-4 hover:bg-brand-800 transition disabled:opacity-40"
              >
                {product.stock > 0 ? 'Hemen Satın Al' : 'Stokta Yok'}
              </button>
            </div>

            {/* Avantajlar */}
            <div className="space-y-3 mb-8 py-6 border-t border-b border-brand-100">
              {[
                { icon: TruckIcon, text: '2500 TL üzeri ücretsiz kargo' },
                { icon: ArrowPathIcon, text: '14 gün içinde koşulsuz iade' },
                { icon: ShieldCheckIcon, text: 'Güvenli ödeme' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-brand-600">
                  <item.icon className="h-4 w-4 text-brand-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-0">
              {accordions.map((acc) => (
                <div key={acc.key} className="border-b border-brand-100">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === acc.key ? null : acc.key)}
                    className="w-full flex justify-between items-center py-4 text-sm font-medium text-brand-800"
                  >
                    {acc.title}
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${openAccordion === acc.key ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion === acc.key && (
                    <div className="pb-4 text-sm text-brand-500 leading-relaxed whitespace-pre-line">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Benzer Ürünler */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-12 border-t border-brand-100">
            <div className="mb-10">
              <span className="text-xs tracking-[0.4em] uppercase font-medium text-brand-500 mb-3 block">
                Benzer Ürünler
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-900">
                Bunlar da Hoşuna Gidebilir
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={(prod) => {
                  const cart = JSON.parse(localStorage.getItem('cart')) || [];
                  const img = prod.image_urls?.[0] || '/placeholder.jpg';
                  const existing = cart.find(item => item.id === prod.id);
                  if (existing) existing.quantity += 1;
                  else cart.push({ id: prod.id, name: prod.name, price: parseFloat(prod.price), image: img, quantity: 1 });
                  localStorage.setItem('cart', JSON.stringify(cart));
                  window.dispatchEvent(new Event('cart-updated'));
                  notify(`${prod.name} sepete eklendi.`);
                }} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ═══ LIGHTBOX (TAM EKRAN) ═══ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Üst Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white text-sm font-mono">
                {selectedImage + 1} / {images.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition disabled:opacity-30"
                  aria-label="Uzaklaştır"
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5" />
                </button>
                <span className="text-white text-sm w-12 text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition disabled:opacity-30"
                  aria-label="Yakınlaştır"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={closeLightbox}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition ml-2"
                  aria-label="Kapat"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Ana Görsel */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${zoom > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-[90vw] max-h-[85vh] object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
                draggable={false}
              />

              {/* Sol/Sağ Oklar */}
              {images.length > 1 && zoom <= 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
                    aria-label="Önceki"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
                    aria-label="Sonraki"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Alt Thumbnail'lar */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-center gap-2 overflow-x-auto max-w-full">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImage(i);
                        setZoom(1);
                        setPosition({ x: 0, y: 0 });
                      }}
                      className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition ${selectedImage === i
                          ? 'border-white'
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bilgi */}
            <p className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-wider hidden md:block">
              Yakınlaştırmak için tıkla, kaydırmak için sürükle
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
