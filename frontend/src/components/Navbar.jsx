// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
    { name: "For You", slug: "for-you" },
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Mobiles", slug: "mobiles" },
    { name: "Electronics", slug: "electronics" },
    { name: "Beauty", slug: "beauty" },
    { name: "Home", slug: "home" },
    { name: "Appliances", slug: "appliances" },
    { name: "Books", slug: "books" }
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation(); // 👈 Added to track current page
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart(); 

    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("for-you");
    const dropdownRef = useRef(null);

    const isSeller =
        user?.role === "seller" ||
        user?.role === "admin" ||
        (Array.isArray(user?.roles) &&
            user.roles.some((r) => r.toLowerCase() === "seller" || r.toLowerCase() === "admin"));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // 👈 Check if we are on the homepage to allow underlining
    const isHomePage = location.pathname === "/";

    return (
        <header style={navStyles.header}>
            <div style={navStyles.topBar}>
                <div style={navStyles.topBarInner}>
                    <Link to="/" style={navStyles.logoLink}>
                        <span style={navStyles.logo}>MyStore</span>
                    </Link>

                    <form onSubmit={handleSearchSubmit} style={navStyles.searchForm}>
                        <input
                            type="text"
                            placeholder="Search for products, brands and more"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={navStyles.searchInput}
                        />
                        <button type="submit" style={navStyles.searchBtn} aria-label="Search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </form>

                    <div style={navStyles.rightActions}>
                        {isAuthenticated ? (
                            <div style={{ position: "relative" }} ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={navStyles.userProfileTrigger}
                                >
                                    <div style={navStyles.avatarCircle}>
                                        {user?.name ? user.name[0].toUpperCase() : "U"}
                                    </div>
                                    <span style={navStyles.userNameText}>{user?.name?.split(" ")[0] || "Account"}</span>
                                    <span
                                        style={{
                                            fontSize: "0.68rem",
                                            color: "#e2e8f0",
                                            display: "inline-block",
                                            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease"
                                        }}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div style={navStyles.dropdownMenu}>
                                        <div style={navStyles.dropdownHeader}>
                                            <span style={navStyles.dropdownUserTitle}>{user?.name}</span>
                                            <span style={navStyles.dropdownUserSub}>{user?.email || user?.phone}</span>
                                        </div>
                                        <div style={navStyles.divider} />
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)} style={navStyles.dropdownItem}>
                                            <span style={navStyles.itemIcon}>👤</span> My Profile
                                        </Link>
                                        <Link to="/orders" onClick={() => setDropdownOpen(false)} style={navStyles.dropdownItem}>
                                            <span style={navStyles.itemIcon}>📦</span> Orders
                                        </Link>
                                        <Link to="/wishlist" onClick={() => setDropdownOpen(false)} style={navStyles.dropdownItem}>
                                            <span style={navStyles.itemIcon}>❤️</span> Wishlist
                                        </Link>
                                        <div style={navStyles.divider} />
                                        {isSeller ? (
                                            <Link to="/seller/dashboard" onClick={() => setDropdownOpen(false)} style={navStyles.dropdownItem}>
                                                <span style={navStyles.itemIcon}>🏬</span> Seller Central
                                            </Link>
                                        ) : (
                                            <Link to="/become-seller" onClick={() => setDropdownOpen(false)} style={navStyles.dropdownItem}>
                                                <span style={navStyles.itemIcon}>🚀</span> Become a Seller
                                            </Link>
                                        )}
                                        <div style={navStyles.divider} />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                logout();
                                            }}
                                            style={navStyles.dropdownLogoutBtn}
                                        >
                                            <span style={navStyles.itemIcon}>🚪</span> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" style={navStyles.signInBtn}>Sign In</Link>
                        )}

                        <Link to="/cart" style={navStyles.cartLink}>
                            <div style={{ position: "relative", display: "inline-flex" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {cartCount > 0 && (
                                    <span style={navStyles.cartBadge}>{cartCount}</span>
                                )}
                            </div>
                            <span style={navStyles.cartText}>Cart</span>
                        </Link>
                    </div>
                </div>
            </div>

            <nav style={navStyles.subCategoryBar}>
                <div style={navStyles.subCategoryInner}>
                    {CATEGORIES.map((cat) => {
                        // 👈 Only apply the green line if we are actually on the homepage
                        const isActive = isHomePage && activeCategory === cat.slug;
                        return (
                            <button
                                key={cat.slug}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(cat.slug);
                                    navigate(cat.slug === "for-you" ? "/" : `/?category=${cat.slug}`);
                                }}
                                style={{
                                    ...navStyles.catButton,
                                    color: isActive ? "#065f46" : "#334155",
                                    borderBottom: isActive ? "3px solid #059669" : "3px solid transparent",
                                    fontWeight: isActive ? "700" : "500"
                                }}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </header>
    );
}

const navStyles = {
    header: { width: "100%", display: "flex", flexDirection: "column", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" },
    topBar: { backgroundColor: "#064e3b", padding: "10px 20px" },
    topBarInner: { maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" },
    logoLink: { textDecoration: "none", flexShrink: 0 },
    logo: { fontSize: "1.45rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.02em" },
    searchForm: { flex: "1 1 auto", maxWidth: "580px", display: "flex", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "4px", overflow: "hidden", height: "40px" },
    searchInput: { flex: 1, border: "none", outline: "none", padding: "0 14px", fontSize: "0.92rem", color: "#1e293b" },
    searchBtn: { background: "none", border: "none", padding: "0 14px", height: "100%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    rightActions: { display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 },
    userProfileTrigger: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "4px 6px", borderRadius: "4px" },
    avatarCircle: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
    userNameText: { color: "#ffffff", fontWeight: 600, fontSize: "0.95rem" },
    signInBtn: { backgroundColor: "#ffffff", color: "#064e3b", fontWeight: "700", fontSize: "0.9rem", padding: "7px 18px", borderRadius: "4px", textDecoration: "none" },
    cartLink: { display: "flex", alignItems: "center", gap: "8px", color: "#ffffff", textDecoration: "none", fontWeight: "700", fontSize: "0.95rem" },
    cartText: { color: "#ffffff" },
    cartBadge: { position: "absolute", top: "-8px", right: "-10px", backgroundColor: "#ef4444", color: "#ffffff", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800", padding: "1px 6px", minWidth: "18px", textAlign: "center", lineHeight: "16px" },
    dropdownMenu: { position: "absolute", right: 0, top: "calc(100% + 10px)", width: "230px", backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)", border: "1px solid #e2e8f0", overflow: "hidden", zIndex: 110, display: "flex", flexDirection: "column" },
    dropdownHeader: { padding: "14px 16px", backgroundColor: "#f8fafc" },
    dropdownUserTitle: { display: "block", fontWeight: "700", fontSize: "0.92rem", color: "#0f172a" },
    dropdownUserSub: { display: "block", fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    itemIcon: { fontSize: "1rem", width: "20px", display: "inline-block" },
    dropdownItem: { padding: "11px 16px", fontSize: "0.88rem", color: "#334155", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" },
    dropdownLogoutBtn: { width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 16px", fontSize: "0.88rem", color: "#dc2626", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" },
    divider: { height: "1px", backgroundColor: "#f1f5f9" },
    subCategoryBar: { backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", overflowX: "auto" },
    subCategoryInner: { maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "28px", padding: "0 20px" },
    catButton: { background: "none", border: "none", padding: "12px 2px 10px 2px", fontSize: "0.92rem", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" }
};