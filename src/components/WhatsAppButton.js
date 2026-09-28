'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ⚠️ KENDİ NUMARANI BURAYA YAZ (90 ile başlasın, boşluksuz)
const WHATSAPP_NUMBER = '9054541519008'; // Örnek: 905551234567
const DEFAULT_MESSAGE = 'Merhaba, yardıma ihtiyacım var.';

export default function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState(DEFAULT_MESSAGE);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSend = () => {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setIsOpen(false);
    };

    return (
        <>
            {/* Sabit Buton */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="WhatsApp ile iletişime geç"
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideDown_0.3s_ease-out]">
                    {/* Header */}
                    <div className="bg-[#25D366] text-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Bize Ulaşın</p>
                                <p className="text-xs opacity-90">Genellikle birkaç dakika içinde yanıt veririz</p>
                            </div>
                        </div>
                    </div>

                    {/* Mesaj Alanı */}
                    <div className="p-4">
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-xs text-gray-500 mb-2">Merhaba 👋 Size nasıl yardımcı olabiliriz?</p>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="3"
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#25D366] resize-none"
                            placeholder="Mesajınızı yazın..."
                        />
                        <button
                            onClick={handleSend}
                            className="w-full mt-3 bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#1eb857] transition text-sm"
                        >
                            WhatsApp'tan Gönder
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}