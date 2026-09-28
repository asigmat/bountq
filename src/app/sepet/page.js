'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const updateQuantity = (id, size, qty) => {
    const updated = cartItems.map(item => item.id === id && item.size === size ? { ...item, quantity: qty } : item);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (id, size) => {
    const updated = cartItems.filter(item => !(item.id === id && item.size === size));
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = total >= 2500 ? 0 : 69.99;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="text-3xl font-serif font-bold text-brand-900 mb-10">Sepetim</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-brand-400 text-lg mb-6">Sepetiniz boş.</p>
          <Link href="/" className="inline-block bg-brand-900 text-white px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 transition">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 divide-y divide-brand-100">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-5 py-6 first:pt-0">
                <div className="w-24 h-32 flex-shrink-0 bg-brand-50 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-brand-900">{item.name}</h3>
                        {item.size && <p className="text-xs text-brand-400 mt-1">Beden: {item.size}</p>}
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-brand-300 hover:text-red-500 transition">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-brand-200">
                      <button onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 text-brand-500 hover:text-brand-900 flex items-center justify-center">−</button>
                      <span className="w-8 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 text-brand-500 hover:text-brand-900 flex items-center justify-center">+</button>
                    </div>
                    <p className="text-sm font-semibold text-brand-900">
                      ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-50 p-6 md:p-8 h-fit">
            <h2 className="text-lg font-serif font-bold text-brand-900 mb-6">Sipariş Özeti</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-brand-600">
                <span>Ara Toplam</span>
                <span>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Kargo</span>
                <span>{shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-brand-200 pt-3 flex justify-between font-semibold text-brand-900 text-base">
                <span>Toplam</span>
                <span>₺{(total + shipping).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <Link href="/odeme">
              <button className="w-full bg-brand-900 text-white py-4 mt-6 text-xs tracking-[0.2em] uppercase font-medium hover:bg-brand-800 transition">
                Ödemeye Geç
              </button>
            </Link>
            <p className="text-xs text-brand-400 text-center mt-4">2500 TL üzeri siparişlerde kargo ücretsizdir.</p>
          </div>
        </div>
      )}
    </div>
  );
}