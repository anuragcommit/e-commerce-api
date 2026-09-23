// src/App.jsx
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
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
import ProductDetailsPage from "./pages/ProductDetailsPage";
import WriteReviewPage from "./pages/WriteReviewPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import SavedAddressesPage from "./pages/SavedAddressesPage";


// Sample full-width banner & product grid matching Amazon reference
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
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
            <Route path="/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/product/:productId/write-review" element={<WriteReviewPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/addresses" element={<SavedAddressesPage />} />
            
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
