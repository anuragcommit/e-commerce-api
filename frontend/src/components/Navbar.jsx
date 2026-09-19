// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { id: "all", label: "For You" },
  { id: "fashion", label: "Fashion" },
  { id: "mobiles", label: "Mobiles" },
  { id: "electronics", label: "Electronics" },
  { id: "beauty", label: "Beauty" },
  { id: "home", label: "Home" },
  { id: "appliances", label: "Appliances" },
  { id: "books", label: "Books" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isSellerPage = location.pathname.startsWith("/seller");
  const isSeller = user?.roles?.includes("seller") || user?.role === "seller";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (id) => {
    navigate(id === "all" ? "/" : `/?category=${id}`);
  };

  const handleSwitchOrLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header style={navStyles.header}>
      <style>{`
                .nav-search-input {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                }
                .nav-search-input::placeholder {
                    color: #64748b !important;
                }
                .cat-strip::-webkit-scrollbar {
                    display: none;
                }
                .cat-strip {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .dropdown-hover-item:hover {
                    background-color: #f8fafc;
                }
                @media (max-width: 640px) {
                    .nav-actions-text {
                        display: none !important;
                    }
                }
            `}</style>

      {/* 1. Main Navigation Bar */}
      <nav style={navStyles.topNav}>
        <div style={navStyles.navContent}>
          {/* Brand Logo */}
          <Link to="/" style={navStyles.brandLink}>
            <span style={{ color: "#ffffff" }}>My</span>
            <span style={{ color: "#34d399" }}>Store</span>
            <span style={navStyles.logoDot} />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={navStyles.searchContainer}>
            <input
              type="text"
              className="nav-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              style={navStyles.searchInput}
            />
            <button
              type="submit"
              style={navStyles.searchButton}
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#065f46"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Actions Row */}
          <div style={navStyles.actionsRow}>
            {isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={navStyles.userButton}
                >
                  <div style={navStyles.userBadge}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span
                    className="nav-actions-text"
                    style={{ color: "#ffffff", fontWeight: 600 }}
                  >
                    {user?.name?.split(" ")[0]} ▾
                  </span>
                </button>
                {/* User Profile Dropdown */}
                {userMenuOpen && (
                  <div style={navStyles.dropdownMenu}>
                    <div style={navStyles.dropdownHeader}>
                      <p style={navStyles.headerName}>{user?.name}</p>
                      <p style={navStyles.headerContact}>
                        {user?.email || user?.phone}
                      </p>
                    </div>

                    <div style={navStyles.divider} />

                    {/* Orders (Always visible to buy/check orders) */}
                    <Link
                      to="/my-orders"
                      className="dropdown-hover-item"
                      onClick={() => setUserMenuOpen(false)}
                      style={navStyles.dropdownItem}
                    >
                      <span style={{ marginRight: "8px" }}>📦</span> My Orders
                    </Link>

                    {/* 👇 PLACE THE DYNAMIC SWITCHER CODE HERE */}
                    {isSeller ? (
                      isSellerPage ? (
                        <Link
                          to="/"
                          className="dropdown-hover-item"
                          onClick={() => setUserMenuOpen(false)}
                          style={navStyles.dropdownItem}
                        >
                          <span style={{ marginRight: "8px" }}>🛍️</span> Switch
                          to Customer Mode
                        </Link>
                      ) : (
                        <Link
                          to="/seller/dashboard"
                          className="dropdown-hover-item"
                          onClick={() => setUserMenuOpen(false)}
                          style={navStyles.dropdownItem}
                        >
                          <span style={{ marginRight: "8px" }}>💼</span> Seller
                          Dashboard
                        </Link>
                      )
                    ) : (
                      <Link
                        to="/become-seller"
                        className="dropdown-hover-item"
                        onClick={() => setUserMenuOpen(false)}
                        style={navStyles.dropdownItem}
                      >
                        <span style={{ marginRight: "8px" }}>✨</span> Become a
                        Seller
                      </Link>
                    )}

                    {/* Switch Account */}
                    <button
                      type="button"
                      className="dropdown-hover-item"
                      onClick={handleSwitchOrLogout}
                      style={navStyles.dropdownActionBtn}
                    >
                      <span style={{ marginRight: "8px" }}>👥</span> Switch
                      Account
                    </button>

                    <div style={navStyles.divider} />

                    {/* Sign Out */}
                    <button
                      type="button"
                      className="dropdown-hover-item"
                      onClick={handleSwitchOrLogout}
                      style={navStyles.logoutItem}
                    >
                      <span style={{ marginRight: "8px" }}>🚪</span> Sign Out
                    </button>
                  </div>
                )}{" "}
              </div>
            ) : (
              <Link to="/login" style={navStyles.authButton}>
                Sign In / Register
              </Link>
            )}

            {/* Live Cart Link */}
            <Link to="/cart" style={navStyles.cartLink}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span style={navStyles.cartBadge}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="nav-actions-text" style={navStyles.cartLabel}>
                Cart
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Sub-Navigation Strip */}
      {!isAuthPage && (
        <div className="cat-strip" style={navStyles.catStrip}>
          <div style={navStyles.catInner}>
            {CATEGORIES.map((cat) => {
              const isActive =
                location.search.includes(`category=${cat.id}`) ||
                (cat.id === "all" && !location.search);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    ...navStyles.catButton,
                    color: isActive ? "#065f46" : "#334155",
                    fontWeight: isActive ? 700 : 500,
                    borderBottom: isActive
                      ? "2.5px solid #10b981"
                      : "2.5px solid transparent",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {userMenuOpen && (
        <div
          onClick={() => setUserMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 90 }}
        />
      )}
    </header>
  );
}

const navStyles = {
  header: {
    width: "100%",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topNav: {
    width: "100%",
    backgroundColor: "#064e3b",
    padding: "10px 20px",
    boxSizing: "border-box",
  },
  navContent: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },
  brandLink: {
    fontSize: "1.45rem",
    fontWeight: "900",
    textDecoration: "none",
    letterSpacing: "-0.03em",
    display: "flex",
    alignItems: "center",
  },
  logoDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#34d399",
    marginLeft: "3px",
  },
  searchContainer: {
    flex: 1,
    maxWidth: "700px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    height: "40px",
    padding: "0 10px",
    boxSizing: "border-box",
  },
  searchInput: {
    width: "100%",
    border: "none",
    fontSize: "0.92rem",
    padding: "6px 8px",
    outline: "none",
  },
  searchButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  authButton: {
    backgroundColor: "#ffffff",
    color: "#064e3b",
    fontWeight: 700,
    fontSize: "0.85rem",
    padding: "8px 18px",
    borderRadius: "4px",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  userBadge: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#34d399",
    color: "#064e3b",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.88rem",
  },
  dropdownMenu: {
    position: "absolute",
    top: "42px",
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    minWidth: "200px",
    border: "1px solid #e2e8f0",
    zIndex: 100,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "12px 16px",
    textAlign: "left",
  },
  headerName: {
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  headerContact: {
    fontSize: "0.78rem",
    margin: "2px 0 0 0",
    color: "#64748b",
  },
  divider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#1e293b",
    textDecoration: "none",
    cursor: "pointer",
  },
  dropdownActionBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    padding: "10px 16px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#1e293b",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  logoutItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    padding: "10px 16px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#dc2626",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  cartLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    cursor: "pointer",
  },
  cartBadge: {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "0.68rem",
    fontWeight: "800",
    padding: "1px 5px",
    borderRadius: "10px",
    border: "1.5px solid #064e3b",
  },
  cartLabel: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.92rem",
  },
  catStrip: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    overflowX: "auto",
  },
  catInner: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "0 16px",
    boxSizing: "border-box",
  },
  catButton: {
    background: "none",
    border: "none",
    padding: "10px 14px",
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
