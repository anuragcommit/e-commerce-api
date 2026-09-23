// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("accessToken") || localStorage.getItem("token") || null;
    });

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        
        setUser(null);
        setToken(null);

        window.dispatchEvent(new Event("auth:logout"));

        window.location.href = "/login";
    };

    const login = (accessToken, userData) => {
        // 1. Save new credentials
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(accessToken);
        setUser(userData);

        // 2. Hard reload to homepage to ensure CartContext fetches the user's saved cart
        window.location.href = "/";
    };

    // Listen for the global 401 interceptor signal
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setToken(null);
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);