// src/App.jsx
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import MyProfilePage from "./pages/MyProfilePage";
import WishlistPage from "./pages/WishlistPage";


function MyOrdersPage() {
    return (
        <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <h2>📦 My Orders</h2>
            <p style={{ color: "#64748b", marginTop: "8px" }}>No recent orders found.</p>
        </div>
    );
}


// Sample full-width banner & product grid matching Amazon reference
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
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/become-seller" element={<BecomeSellerPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            
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
