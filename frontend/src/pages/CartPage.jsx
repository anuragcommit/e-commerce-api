// src/pages/CartPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const { isAuthenticated } = useAuth();
    const { cartItems, cartCount } = useCart();

    if (cartCount === 0) {
        return (
            <div style={cartUi.container}>
                <div style={cartUi.card}>
                    {/* SVG Empty Cart Illustration matching Flipkart/Amazon */}
                    <div style={cartUi.illustration}>
                        <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
                            <ellipse cx="100" cy="165" rx="75" ry="8" fill="#f1f5f9" />
                            <path
                                d="M45 55h15l18 65h72l14-50H68"
                                stroke="#94a3b8"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="85" cy="142" r="10" stroke="#94a3b8" strokeWidth="5" fill="#ffffff" />
                            <circle cx="145" cy="142" r="10" stroke="#94a3b8" strokeWidth="5" fill="#ffffff" />
                            {/* Accent Package badge */}
                            <rect x="95" y="70" width="30" height="26" rx="3" fill="#34d399" />
                            <line x1="95" y1="83" x2="125" y2="83" stroke="#064e3b" strokeWidth="2" />
                        </svg>
                    </div>

                    <h2 style={cartUi.title}>
                        {isAuthenticated ? "Your cart is empty!" : "Missing Cart items?"}
                    </h2>
                    <p style={cartUi.subtitle}>
                        {isAuthenticated
                            ? "Explore our product catalog and discover great deals."
                            : "Log in to see the items you previously added to your cart."}
                    </p>

                    <div style={cartUi.buttonGroup}>
                        {!isAuthenticated && (
                            <Link to="/login" style={cartUi.primaryBtn}>
                                Sign in to your account
                            </Link>
                        )}
                        <Link to="/" style={!isAuthenticated ? cartUi.secondaryBtn : cartUi.primaryBtn}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px 24px", maxWidth: "1200px", margin: "0 auto" }}>
            <h2>Shopping Cart ({cartCount} items)</h2>
            {/* Populated cart items render here */}
        </div>
    );
}

const cartUi = {
    container: {
        width: "100%",
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "20px"
    },
    card: {
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "48px 32px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)"
    },
    illustration: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px"
    },
    title: {
        fontSize: "1.45rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: "0 0 8px 0"
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#64748b",
        margin: "0 0 24px 0"
    },
    buttonGroup: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px"
    },
    primaryBtn: {
        backgroundColor: "#10b981",
        color: "#ffffff",
        padding: "11px 28px",
        borderRadius: "6px",
        fontWeight: "700",
        fontSize: "0.92rem",
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)"
    },
    secondaryBtn: {
        backgroundColor: "transparent",
        color: "#065f46",
        padding: "8px 20px",
        borderRadius: "6px",
        fontWeight: "600",
        fontSize: "0.88rem",
        textDecoration: "none"
    }
};