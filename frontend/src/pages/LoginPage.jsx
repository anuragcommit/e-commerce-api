// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Ensures location is never undefined
    const { login } = useAuth();

    const [loginMode, setLoginMode] = useState("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [focusedField, setFocusedField] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handlePhoneChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        if (digitsOnly.length <= 10) {
            setPhone(digitsOnly);
        }
        setError("");
    };

    const toggleMode = () => {
        setError("");
        if (loginMode === "phone") {
            setLoginMode("email");
            setPhone("");
        } else {
            setLoginMode("phone");
            setEmail("");
        }
    };

    // Regex checks
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Derived validation flag
    const isFormValid =
        password.length >= 6 &&
        ((loginMode === "phone" && phoneRegex.test(phone)) ||
            (loginMode === "email" && emailRegex.test(email.trim())));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || submitting) return;

        setError("");
        setSubmitting(true);

        const payload = {
            password,
            ...(loginMode === "phone" ? { phone: Number(phone) } : { email: email.trim().toLowerCase() })
        };

        try {
            const res = await API.post("/users/login", payload);
            const { accessToken, user } = res.data.data;

            login(accessToken, user);

            // Safe fallback redirect
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
        } catch (err) {
            let backendMessage = "";
            if (err.response?.data) {
                const data = err.response.data;
                backendMessage = data.message || (Array.isArray(data.errors) ? data.errors.join(", ") : "");
            } else if (err.request) {
                backendMessage = "Server unreachable. Make sure backend is running.";
            } else {
                backendMessage = err.message || "An unexpected error occurred.";
            }
            setError(backendMessage || "Login failed. Please check your credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={loginStyles.viewport}>
            <div style={loginStyles.card}>
                <div style={loginStyles.header}>
                    <h1 style={loginStyles.title}>Log in for the best experience</h1>
                    <p style={loginStyles.subtitle}>
                        {loginMode === "phone" ? "Enter your phone number to continue" : "Enter your email address to continue"}
                    </p>
                </div>

                {error && (
                    <div style={loginStyles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={loginStyles.form}>
                    {loginMode === "phone" ? (
                        <div style={{
                            ...loginStyles.inputBox,
                            borderColor: focusedField === "phone" ? "#2874f0" : "#d5d9d9"
                        }}>
                            <div style={loginStyles.dialCode}>
                                <span>+91</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#565959">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </div>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder={focusedField === "phone" ? "" : "Phone Number"}
                                value={phone}
                                onFocus={() => setFocusedField("phone")}
                                onBlur={() => setFocusedField(null)}
                                onChange={handlePhoneChange}
                                style={loginStyles.input}
                            />
                            <span style={loginStyles.counter}>{phone.length}/10</span>
                        </div>
                    ) : (
                        <div style={{
                            ...loginStyles.inputBox,
                            borderColor: focusedField === "email" ? "#2874f0" : "#d5d9d9"
                        }}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={focusedField === "email" ? "" : "Email Address"}
                                value={email}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                style={loginStyles.input}
                            />
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" onClick={toggleMode} style={loginStyles.switchBtn}>
                            {loginMode === "phone" ? "Use Email-ID" : "Use Phone Number"}
                        </button>
                    </div>

                    <div style={{
                        ...loginStyles.inputBox,
                        borderColor: focusedField === "password" ? "#2874f0" : "#d5d9d9"
                    }}>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={focusedField === "password" ? "" : "Enter Password"}
                            value={password}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            style={loginStyles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={loginStyles.showBtn}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <p style={loginStyles.legalText}>
                        By continuing, you confirm that you are above 18 years of age, and you agree to MyStore's{" "}
                        <span style={{ color: "#2874f0", cursor: "pointer" }}>Terms of Use</span> and{" "}
                        <span style={{ color: "#2874f0", cursor: "pointer" }}>Privacy Policy</span>.
                    </p>

                    <button
                        type="submit"
                        disabled={!isFormValid || submitting}
                        style={{
                            ...loginStyles.continueBtn,
                            backgroundColor: isFormValid ? "#fb641b" : "#cbd5e1",
                            cursor: isFormValid && !submitting ? "pointer" : "not-allowed",
                            boxShadow: isFormValid ? "0 2px 6px rgba(251, 100, 27, 0.3)" : "none"
                        }}
                    >
                        {submitting ? "Verifying..." : "Continue"}
                    </button>
                </form>

                <div style={loginStyles.footer}>
                    New to MyStore?{" "}
                    <Link to="/register" style={loginStyles.link}>
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}

const loginStyles = {
    viewport: {
        width: "100%",
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        padding: "20px 16px",
        boxSizing: "border-box"
    },
    card: {
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "36px 32px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box"
    },
    header: {
        marginBottom: "20px",
        textAlign: "left"
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: "0 0 6px 0"
    },
    subtitle: {
        fontSize: "0.85rem",
        color: "#64748b",
        margin: 0
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    inputBox: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ffffff",
        border: "1.5px solid #cbd5e1",
        borderRadius: "4px",
        padding: "0 12px",
        height: "46px",
        boxSizing: "border-box",
        transition: "border-color 0.15s ease"
    },
    dialCode: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        paddingRight: "10px",
        marginRight: "8px",
        borderRight: "1px solid #e2e8f0",
        color: "#0f172a",
        fontWeight: 600,
        fontSize: "0.92rem",
        userSelect: "none"
    },
    input: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "0.92rem",
        color: "#0f172a",
        outline: "none"
    },
    counter: {
        fontSize: "0.75rem",
        color: "#94a3b8",
        marginLeft: "8px",
        whiteSpace: "nowrap"
    },
    switchBtn: {
        background: "none",
        border: "none",
        color: "#2874f0",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        padding: 0
    },
    showBtn: {
        background: "none",
        border: "none",
        color: "#2874f0",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        padding: "4px"
    },
    legalText: {
        fontSize: "0.76rem",
        color: "#64748b",
        lineHeight: 1.45,
        margin: "4px 0"
    },
    continueBtn: {
        width: "100%",
        height: "44px",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        fontSize: "0.92rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        transition: "background-color 0.2s ease, box-shadow 0.2s ease"
    },
    errorBanner: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        padding: "9px 12px",
        borderRadius: "4px",
        fontSize: "0.82rem",
        marginBottom: "12px"
    },
    footer: {
        marginTop: "24px",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "#334155"
    },
    link: {
        color: "#2874f0",
        fontWeight: 700,
        textDecoration: "none",
        marginLeft: "4px"
    }
};