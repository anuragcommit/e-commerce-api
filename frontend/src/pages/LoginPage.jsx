// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const res = await API.post("/users/login", {
                email: formData.email,
                password: formData.password
            });

            // Backend ApiResponse standard: res.data.data
            const { accessToken, user } = res.data.data;

            // Store in AuthContext & LocalStorage
            login(accessToken, user);

            navigate("/");
        } catch (err) {
            // Extract backend custom ApiError message
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sign In</h2>

                {error && <div style={errorStyle}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...buttonStyle,
                            background: submitting ? "#718096" : "#3182ce",
                            cursor: submitting ? "not-allowed" : "pointer"
                        }}
                    >
                        {submitting ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9rem" }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "#3182ce", fontWeight: "bold" }}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}

// Inline Styles for pure React without external CSS dependencies
const containerStyle = {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
};

const cardStyle = {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0"
};

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.875rem",
    fontWeight: "bold",
    color: "#4a5568"
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #cbd5e0",
    boxSizing: "border-box",
    fontSize: "0.95rem"
};

const buttonStyle = {
    width: "100%",
    padding: "10px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    marginTop: "8px"
};

const errorStyle = {
    background: "#fed7d7",
    color: "#9b2c2c",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "14px",
    fontSize: "0.9rem"
};