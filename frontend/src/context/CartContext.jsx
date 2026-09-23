// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // 1. Fetch Cart from Backend
    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setCartCount(0);
            return;
        }

        try {
            // 👇 Calling your exact backend route: /getCart
            const res = await API.get("/cart/getCart"); 
            
            // Extract items based on standard backend response structure
            const items = res.data?.data?.items || res.data?.items || [];
            
            setCartItems(items);
            
            // Update total count for the Navbar badge
            const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            setCartCount(totalUnits);
        } catch (error) {
            console.error("Failed to fetch cart on login:", error);
            setCartItems([]);
            setCartCount(0);
        }
    };

    // Automatically fetch the cart whenever the user logs in or loads the page
    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    // 2. Add to Cart
    const addToCart = async (product) => {
        if (!isAuthenticated) return alert("Please login to add items to your cart.");
        
        try {
            const actualProductId = product.product?._id || product._id || product;
            // 👇 Calling your exact backend route: /add-to-cart
            await API.post("/cart/add-to-cart", { 
                productId: actualProductId, 
                quantity: 1 
            });
            await fetchCart(); // Refresh cart data
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add to cart");
        }
    };

    // 3. Decrement Quantity
    const decrementQuantity = async (productId) => {
        try {
            // Find current item to calculate new quantity
            const item = cartItems.find(i => (i.product?._id || i._id) === productId);
            if (!item || item.quantity <= 1) return;

            // 👇 Calling your exact backend route: /update-quantity
            await API.patch("/cart/update-quantity", { 
                productId: productId, 
                quantity: item.quantity - 1 
            });
            await fetchCart();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update quantity");
        }
    };

    // 4. Remove from Cart
    const removeFromCart = async (productId) => {
        try {
            // 👇 Calling your exact backend route: /remove/:productId
            await API.delete(`/cart/remove/${productId}`);
            await fetchCart();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove item");
        }
    };

    // 5. Clear Cart entirely
    const clearCart = async () => {
        try {
            // 👇 Calling your exact backend route: /clear-cart
            await API.delete("/cart/clear-cart");
            await fetchCart();
        } catch (error) {
            console.error("Failed to clear cart", error);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                addToCart,
                decrementQuantity,
                removeFromCart,
                clearCart,
                fetchCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);