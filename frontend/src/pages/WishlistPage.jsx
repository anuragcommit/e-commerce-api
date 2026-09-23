// src/pages/WishlistPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const fetchWishlist = async () => {
        try {
            const res = await API.get("/wishlist");
            // Handles different potential backend response structures
            const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
            setWishlist(items);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await API.delete(`/wishlist/remove/${productId}`);
            // Instantly remove it from the UI without needing a page refresh
            setWishlist(wishlist.filter(item => (item.product?._id || item._id) !== productId));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove from wishlist");
        }
    };

    const handleMoveToCart = async (item) => {
        const product = item.product || item;
        // 1. Add it to the cart using your global context
        await addToCart(product);
        // 2. Remove it from the wishlist
        await handleRemoveFromWishlist(product._id);
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading wishlist...</div>;
    }

    if (wishlist.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <div style={styles.emptyCard}>
                    <p style={{ fontSize: "3rem", margin: "0 0 16px 0" }}>❤️</p>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                        Your Wishlist is Empty
                    </h2>
                    <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "0 0 24px 0" }}>
                        Save items you love here and buy them later.
                    </p>
                    <Link to="/" style={styles.primaryBtn}>
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.viewport}>
            <div style={styles.container}>
                <h2 style={styles.pageTitle}>My Wishlist ({wishlist.length})</h2>
                
                <div style={styles.grid}>
                    {wishlist.map((item, index) => {
                        // Extract product data safely
                        const product = item.product || item;
                        const productId = product._id;
                        
                        const title = product.title || "Product Unavailable";
                        const price = product.price || 0;
                        const originalPrice = product.originalPrice || price;
                        const image = product.images?.[0] || "https://placehold.co/200x200?text=Product";
                        const discount = originalPrice > price 
                            ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                            : 0;

                        const uniqueKey = item._id || productId || `wishlist-${index}`;

                        return (
                            <div key={uniqueKey} style={styles.card}>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveFromWishlist(productId)}
                                    style={styles.deleteBtn}
                                    title="Remove from wishlist"
                                >
                                    ✕
                                </button>
                                
                                <div style={styles.imageContainer}>
                                    <img src={image} alt={title} style={styles.image} />
                                </div>
                                
                                <div style={styles.details}>
                                    <h3 style={styles.title} title={title}>
                                        {title.length > 40 ? title.substring(0, 40) + "..." : title}
                                    </h3>
                                    
                                    <div style={styles.priceRow}>
                                        <span style={styles.price}>₹{price.toLocaleString("en-IN")}</span>
                                        {originalPrice > price && (
                                            <>
                                                <span style={styles.originalPrice}>₹{originalPrice.toLocaleString("en-IN")}</span>
                                                <span style={styles.discount}>{discount}% Off</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <button 
                                    type="button" 
                                    onClick={() => handleMoveToCart(item)}
                                    disabled={product.stock < 1}
                                    style={{
                                        ...styles.moveToCartBtn,
                                        backgroundColor: product.stock < 1 ? "#cbd5e1" : "#fb641b",
                                        cursor: product.stock < 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {product.stock < 1 ? "OUT OF STOCK" : "MOVE TO CART"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const styles = {
    viewport: { width: "100%", minHeight: "calc(100vh - 110px)", backgroundColor: "#f1f3f6", padding: "24px 20px" },
    container: { maxWidth: "1280px", margin: "0 auto" },
    pageTitle: { fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
    card: { backgroundColor: "#ffffff", borderRadius: "4px", border: "1px solid #e2e8f0", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", transition: "box-shadow 0.2s ease" },
    deleteBtn: { position: "absolute", top: "10px", right: "10px", background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", fontWeight: "bold", zIndex: 10 },
    imageContainer: { width: "100%", height: "200px", padding: "20px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
    image: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
    details: { padding: "16px", flex: 1, borderTop: "1px solid #f1f5f9" },
    title: { fontSize: "0.9rem", color: "#334155", margin: "0 0 10px 0", fontWeight: 500, lineHeight: "1.4" },
    priceRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
    price: { fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" },
    originalPrice: { fontSize: "0.85rem", color: "#94a3b8", textDecoration: "line-through" },
    discount: { fontSize: "0.8rem", color: "#10b981", fontWeight: 700 },
    moveToCartBtn: { width: "100%", border: "none", color: "#ffffff", padding: "14px 0", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.02em" },
    emptyContainer: { width: "100%", minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "20px" },
    emptyCard: { width: "100%", maxWidth: "400px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px 24px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" },
    primaryBtn: { display: "inline-block", backgroundColor: "#2874f0", color: "#ffffff", padding: "12px 32px", borderRadius: "4px", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }
};