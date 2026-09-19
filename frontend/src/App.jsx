// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/my-orders" element={<MyOrdersPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/" element={<p style={{ padding: "20px" }}>Product Listing Page</p>} />
                    <Route path="*" element={<p style={{ padding: "20px" }}>Page Not Found</p>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}