// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={{ padding: "12px 24px", background: "#1a202c", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold", fontSize: "1.2rem" }}>
                MyStore
            </Link>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <Link to="/" style={{ color: "#e2e8f0", textDecoration: "none" }}>Products</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/cart" style={{ color: "#e2e8f0", textDecoration: "none" }}>Cart</Link>
                        <Link to="/my-orders" style={{ color: "#e2e8f0", textDecoration: "none" }}>My Orders</Link>
                        <span style={{ color: "#cbd5e0", fontSize: "0.9rem" }}>
                            Hi, <strong>{user?.username}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px" }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: "#e2e8f0", textDecoration: "none" }}>Login</Link>
                        <Link to="/register" style={{ color: "#e2e8f0", textDecoration: "none" }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}