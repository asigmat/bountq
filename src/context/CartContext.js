'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
    };

    useEffect(() => {
        refreshCart();

        // Diğer sayfa/component'lerden gelen güncellemeleri dinle
        const handler = () => refreshCart();
        window.addEventListener('cart-updated', handler);
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener('cart-updated', handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}