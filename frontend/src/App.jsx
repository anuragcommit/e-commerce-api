// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import BecomeSellerPage from "./pages/BecomeSellerPage";


function MyOrdersPage() {
    return (
        <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <h2>📦 My Orders</h2>
            <p style={{ color: "#64748b", marginTop: "8px" }}>No recent orders found.</p>
        </div>
    );
}


function SellerDashboardPage() {
    return (
        <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <h2>💼 Seller Dashboard</h2>
            <p style={{ color: "#64748b", marginTop: "8px" }}>Manage your catalog, inventory, and orders here.</p>
        </div>
    );
}

// Sample full-width banner & product grid matching Amazon reference
function HomePage() {
  return (
    <div style={{ width: "100%", padding: "20px", boxSizing: "border-box" }}>
      <h2 style={{ marginBottom: "16px", color: "#0f172a" }}>
        Today's Deals & Trending Products
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          width: "100%",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                height: "160px",
                backgroundColor: "#f1f5f9",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            />
            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>
              Product Title {item}
            </h4>
            <p style={{ fontWeight: 700, margin: 0, color: "#065f46" }}>
              ₹1,499
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* The Navbar stays at the top across all pages */}
          <Navbar />

          {/* Routes guarantee that ONLY the active page's component renders */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/become-seller" element={<BecomeSellerPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            
            //404 unmatched route catching
            <Route
              path="*"
              element={
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <h2>404 - Page Not Found</h2>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
