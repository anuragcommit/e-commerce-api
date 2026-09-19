// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "customer"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handlePhoneChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        if (digitsOnly.length <= 10) {
            setFormData((prev) => ({ ...prev, phone: digitsOnly }));
        }
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setSubmitting(true);

        try {
            await API.post("/users/register", formData);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please check your credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={ui.page}>
            <style>{`
                .responsive-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                @media (max-width: 520px) {
                    .responsive-grid {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    .auth-card {
                        padding: 24px 20px !important;
                        border-radius: 18px !important;
                    }
                }
            `}</style>

            <div style={ui.blobTop} />
            <div style={ui.blobBottom} />

            <div className="auth-card" style={ui.card}>
                {/* Compact Header */}
                <div style={ui.header}>
                    <div style={ui.badge}>Sign Up</div>
                    <h1 style={ui.title}>Create Account</h1>
                    <p style={ui.subtitle}>Get started in seconds with your store account.</p>
                </div>

                {/* Role Switcher */}
                <div style={ui.roleContainer}>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "customer" })}
                        style={{
                            ...ui.roleButton,
                            backgroundColor: formData.role === "customer" ? "#ffffff" : "transparent",
                            color: formData.role === "customer" ? "#0f172a" : "#64748b",
                            boxShadow: formData.role === "customer" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                        }}
                    >
                        🛍️ Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "seller" })}
                        style={{
                            ...ui.roleButton,
                            backgroundColor: formData.role === "seller" ? "#ffffff" : "transparent",
                            color: formData.role === "seller" ? "#0f172a" : "#64748b",
                            boxShadow: formData.role === "seller" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                        }}
                    >
                        💼 Seller
                    </button>
                </div>

                {error && (
                    <div style={ui.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={ui.form}>
                    {/* Row 1: Name & Phone combined side-by-side to save height */}
                    <div className="responsive-grid">
                        <div style={ui.fieldWrapper}>
                            <label style={ui.label}>Full Name</label>
                            <div style={{
                                ...ui.inputContainer,
                                borderColor: focusedField === "name" ? "#2563eb" : "#e2e8f0"
                            }}>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder={focusedField === "name" ? "" : "John Doe"}
                                    value={formData.name}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={handleChange}
                                    style={ui.input}
                                />
                            </div>
                        </div>

                        <div style={ui.fieldWrapper}>
                            <div style={ui.labelRow}>
                                <label style={ui.label}>Phone</label>
                                <span style={{
                                    ...ui.counter,
                                    color: formData.phone.length === 10 ? "#16a34a" : "#94a3b8"
                                }}>
                                    {formData.phone.length}/10
                                </span>
                            </div>
                            <div style={{
                                ...ui.inputContainer,
                                borderColor: focusedField === "phone" ? "#2563eb" : "#e2e8f0"
                            }}>
                                <span style={ui.prefix}>+91</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    inputMode="numeric"
                                    placeholder={focusedField === "phone" ? "" : "9876543210"}
                                    value={formData.phone}
                                    onFocus={() => setFocusedField("phone")}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={handlePhoneChange}
                                    style={ui.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div style={ui.fieldWrapper}>
                        <label style={ui.label}>Email Address</label>
                        <div style={{
                            ...ui.inputContainer,
                            borderColor: focusedField === "email" ? "#2563eb" : "#e2e8f0"
                        }}>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder={focusedField === "email" ? "" : "you@example.com"}
                                value={formData.email}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                onChange={handleChange}
                                style={ui.input}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={ui.fieldWrapper}>
                        <label style={ui.label}>Password</label>
                        <div style={{
                            ...ui.inputContainer,
                            borderColor: focusedField === "password" ? "#2563eb" : "#e2e8f0"
                        }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                placeholder={focusedField === "password" ? "" : "••••••••"}
                                value={formData.password}
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField(null)}
                                onChange={handleChange}
                                style={ui.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={ui.toggleBtn}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...ui.submitBtn,
                            opacity: submitting ? 0.75 : 1,
                            cursor: submitting ? "not-allowed" : "pointer"
                        }}
                    >
                        {submitting ? "Creating account..." : `Sign Up as ${formData.role === "seller" ? "Seller" : "Customer"}`}
                    </button>
                </form>

                <div style={ui.footer}>
                    Already have an account?{" "}
                    <Link to="/login" style={ui.loginLink}>
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}

const ui = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    blobTop: {
        position: "absolute",
        top: "-80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "360px",
        height: "360px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(15, 23, 42, 0) 70%)",
        pointerEvents: "none"
    },
    blobBottom: {
        position: "absolute",
        bottom: "-100px",
        right: "-60px",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%)",
        pointerEvents: "none"
    },
    card: {
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "28px 26px",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
        zIndex: 1,
        boxSizing: "border-box"
    },
    header: {
        marginBottom: "16px",
        textAlign: "center"
    },
    badge: {
        display: "inline-block",
        fontSize: "0.7rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#2563eb",
        backgroundColor: "#eff6ff",
        padding: "3px 8px",
        borderRadius: "12px",
        marginBottom: "6px"
    },
    title: {
        fontSize: "1.45rem",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 4px 0",
        letterSpacing: "-0.02em"
    },
    subtitle: {
        fontSize: "0.825rem",
        color: "#64748b",
        margin: 0
    },
    roleContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        backgroundColor: "#f1f5f9",
        borderRadius: "10px",
        padding: "3px",
        gap: "4px",
        marginBottom: "14px"
    },
    roleButton: {
        padding: "8px",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.825rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "11px"
    },
    fieldWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        textAlign: "left"
    },
    labelRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    label: {
        fontSize: "0.775rem",
        fontWeight: "600",
        color: "#334155"
    },
    counter: {
        fontSize: "0.7rem",
        fontWeight: "600"
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        padding: "0 12px",
        transition: "border-color 0.2s ease"
    },
    prefix: {
        fontSize: "0.8rem",
        fontWeight: "600",
        color: "#64748b",
        marginRight: "6px"
    },
    input: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        padding: "9px 0",
        fontSize: "0.875rem",
        color: "#0f172a",
        outline: "none"
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#2563eb",
        fontSize: "0.75rem",
        fontWeight: "600",
        cursor: "pointer",
        padding: "4px 6px"
    },
    submitBtn: {
        marginTop: "6px",
        padding: "11px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
        fontSize: "0.9rem",
        fontWeight: "700",
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
        transition: "background-color 0.2s ease"
    },
    errorBanner: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fee2e2",
        color: "#b91c1c",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "0.78rem",
        marginBottom: "10px",
        textAlign: "left"
    },
    footer: {
        marginTop: "16px",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "#64748b"
    },
    loginLink: {
        color: "#2563eb",
        fontWeight: "700",
        textDecoration: "none"
    }
};