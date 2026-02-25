import React, { createContext, useContext, useState, useEffect } from 'react';
import cartAPI from '../api/cart';
import loyaltyAPI from '../api/loyalty';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated, isEmailVerified } = useAuth();
    const [cart, setCart] = useState(null);
    const [loyaltyInfo, setLoyaltyInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart
    const fetchCart = async () => {
        if (!isAuthenticated || !isEmailVerified) {
            setCart(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await cartAPI.getCart();
            setCart(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch loyalty points
    const fetchLoyaltyPoints = async () => {
        if (!isAuthenticated) {
            setLoyaltyInfo(null);
            return;
        }

        try {
            const data = await loyaltyAPI.getLoyaltyPoints();
            setLoyaltyInfo(data);
        } catch (err) {
            console.error('Error fetching loyalty points:', err);
        }
    };

    // Add to cart
    const addToCart = async (productId, quantity = 1, variant = null) => {
        try {
            // Updated to pass variant info. API key is generally body.
            const data = await cartAPI.addToCart(productId, quantity, variant);
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error adding to cart:', err);
            throw err;
        }
    };

    // Update cart item
    const updateCartItem = async (itemId, quantity) => {
        try {
            const data = await cartAPI.updateCartItem(itemId, quantity);
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error updating cart:', err);
            throw err;
        }
    };

    // Remove from cart
    const removeFromCart = async (itemId) => {
        try {
            const data = await cartAPI.removeFromCart(itemId);
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error removing from cart:', err);
            throw err;
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            const data = await cartAPI.clearCart();
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error clearing cart:', err);
            throw err;
        }
    };

    // Apply promo code
    const applyPromoCode = async (code) => {
        try {
            const data = await cartAPI.applyPromoCode(code);
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error applying promo code:', err);
            throw err;
        }
    };

    // Redeem points
    const redeemPoints = async (points) => {
        try {
            const data = await cartAPI.redeemPoints(points);
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error redeeming points:', err);
            throw err;
        }
    };

    // Remove points
    const removePoints = async () => {
        try {
            const data = await cartAPI.removePoints();
            setCart(data);
            return data;
        } catch (err) {
            console.error('Error removing points:', err);
            throw err;
        }
    };

    // Load cart when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
            fetchLoyaltyPoints();
        } else {
            setCart(null);
        }
    }, [isAuthenticated, isEmailVerified]);

    const value = {
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyPromoCode,
        redeemPoints,
        removePoints,
        fetchLoyaltyPoints,
        loyaltyInfo,
        itemCount: cart?.items?.length || 0,
        total: cart?.total || 0
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export default CartContext;
