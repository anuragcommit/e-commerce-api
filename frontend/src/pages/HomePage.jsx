// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";

export default function HomePage() {
    const location = useLocation();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
        setLoading(true);
        setError("");
        try {
            const query = location.search || "";
            const res = await API.get(`/products${query}`);

            // Safely extract the array whether it returns { products: [] } or a raw array []
            const data = res.data?.data;
            const items = Array.isArray(data) ? data : (data?.products || []);

            setProducts(items);
        } catch (err) {
            setError("Failed to load products. Please check server connectivity.");
        } finally {
            setLoading(false);
        }
    };

    fetchCatalog();
}, [location.search]);

    const handleAddToCart = (product) => {
        addToCart(product);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1200);
    };

    return (
        <main style={styles.container}>
            {/* Embedded styles for responsive grid and card hover */}
            <style>{`
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 16px;
                }
                .product-card {
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .product-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                }
                @media (max-width: 540px) {
                    .product-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }
                    .card-padding {
                        padding: 10px !important;
                    }
                    .card-image-box {
                        height: 140px !important;
                    }
                    .card-title {
                        font-size: 0.8rem !important;
                    }
                }
            `}</style>

            {/* Error Message */}
            {error && <div style={styles.errorBox}>{error}</div>}

            {/* Loading Skeleton */}
            {loading ? (
                <div className="product-grid">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} style={styles.skeletonCard} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>🔍</p>
                    <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>No products found</h3>
                    <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                        Try checking your spelling or adjusting your category filter.
                    </p>
                </div>
            ) : (
                /* Product Catalog Grid */
                <div className="product-grid">
                    {products.map((item) => {
                        const discount = item.originalPrice > item.price
                            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                            : 0;

                        return (
                            <div key={item._id} className="product-card card-padding" style={styles.card}>
                                {/* Image Container */}
                                <div className="card-image-box" style={styles.imageBox}>
                                    <img
                                        src={item.images?.[0] || "https://placehold.co/300x300"}
                                        alt={item.title}
                                        style={styles.image}
                                        loading="lazy"
                                    />
                                    {discount > 0 && (
                                        <span style={styles.discountBadge}>{discount}% off</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div style={styles.info}>
                                    <span style={styles.brand}>{item.brand}</span>
                                    <h3 className="card-title" style={styles.title} title={item.title}>
                                        {item.title}
                                    </h3>

                                    {/* Star Rating Capsule */}
                                    <div style={styles.ratingRow}>
                                        <span style={styles.ratingBadge}>
                                            {item.rating || 4.2} ★
                                        </span>
                                        <span style={styles.reviewsCount}>
                                            ({(item.numReviews || 0).toLocaleString()})
                                        </span>
                                    </div>

                                    {/* Price Line */}
                                    <div style={styles.priceRow}>
                                        <span style={styles.currentPrice}>
                                            ₹{item.price.toLocaleString("en-IN")}
                                        </span>
                                        {item.originalPrice > item.price && (
                                            <span style={styles.originalPrice}>
                                                ₹{item.originalPrice.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(item)}
                                        style={{
                                            ...styles.addToCartBtn,
                                            backgroundColor: addedId === item._id ? "#10b981" : "#fb641b"
                                        }}
                                    >
                                        {addedId === item._id ? "✓ Added" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

const styles = {
    container: {
        width: "100%",
        padding: "16px 20px",
        boxSizing: "border-box",
        minHeight: "calc(100vh - 110px)",
        backgroundColor: "#f1f3f6"
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        padding: "14px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box"
    },
    imageBox: {
        position: "relative",
        width: "100%",
        height: "190px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
        borderRadius: "4px"
    },
    image: {
        maxHeight: "100%",
        maxWidth: "100%",
        objectFit: "contain"
    },
    discountBadge: {
        position: "absolute",
        top: "8px",
        left: "8px",
        backgroundColor: "#388e3c",
        color: "#ffffff",
        fontSize: "0.72rem",
        fontWeight: "700",
        padding: "2px 6px",
        borderRadius: "3px"
    },
    info: {
        display: "flex",
        flexDirection: "column",
        marginTop: "10px"
    },
    brand: {
        fontSize: "0.72rem",
        color: "#878787",
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: "2px"
    },
    title: {
        fontSize: "0.88rem",
        fontWeight: "600",
        color: "#212121",
        margin: "0 0 6px 0",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: "1.3",
        height: "2.6em"
    },
    ratingRow: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "8px"
    },
    ratingBadge: {
        backgroundColor: "#388e3c",
        color: "#ffffff",
        fontSize: "0.72rem",
        fontWeight: "700",
        padding: "2px 6px",
        borderRadius: "3px"
    },
    reviewsCount: {
        fontSize: "0.75rem",
        color: "#878787"
    },
    priceRow: {
        display: "flex",
        alignItems: "baseline",
        gap: "8px",
        marginBottom: "12px"
    },
    currentPrice: {
        fontSize: "1.05rem",
        fontWeight: "700",
        color: "#212121"
    },
    originalPrice: {
        fontSize: "0.82rem",
        color: "#878787",
        textDecoration: "line-through"
    },
    addToCartBtn: {
        width: "100%",
        padding: "9px 0",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        fontSize: "0.85rem",
        fontWeight: "700",
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    skeletonCard: {
        height: "320px",
        backgroundColor: "#e2e8f0",
        borderRadius: "6px",
        animation: "pulse 1.5s infinite"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px"
    },
    errorBox: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        padding: "12px",
        borderRadius: "4px",
        marginBottom: "16px",
        textAlign: "center",
        fontSize: "0.88rem"
    }
};