// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    // Check if user was redirected due to an expired session
    const sessionExpired = searchParams.get("session_expired") === "true";

    const [loginMode, setLoginMode] = useState("email"); // "email" | "phone"
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleIdentifierChange = (e) => {
        setError("");
        const val = e.target.value;

        if (loginMode === "phone") {
            const digitsOnly = val.replace(/\D/g, "");
            if (digitsOnly.length <= 10) {
                setIdentifier(digitsOnly);
            }
        } else {
            setIdentifier(val);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (loginMode === "phone" && identifier.trim().length !== 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        setSubmitting(true);

        const payload = {
            [loginMode === "phone" ? "phone" : "email"]: loginMode === "phone" ? Number(identifier.trim()) : identifier.trim().toLowerCase(),
            password: password
        };

        try {
            const res = await API.post("/users/login", payload);
            const { accessToken, user } = res.data.data;

            login(accessToken, user);

            // Redirect back to intended page or home
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
        } catch (err) {
            const message = err.response?.data?.message || "Invalid credentials. Please try again.";
            setError(message);
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
                        {loginMode === "phone"
                            ? "Enter your phone number to continue"
                            : "Enter your email address to continue"}
                    </p>
                </div>

                {/* Session Expired Notice */}
                {sessionExpired && !error && (
                    <div style={loginStyles.errorBanner}>
                        Your session has expired. Please log in again to continue.
                    </div>
                )}

                {/* Dynamic Error Banner */}
                {error && (
                    <div style={loginStyles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Input Area */}
                <form onSubmit={handleSubmit} style={loginStyles.form}>
                    {/* Identifier Input Box */}
                    <div style={loginStyles.inputGroup}>
                        <div style={loginStyles.inputBox}>
                            {loginMode === "phone" && (
                                <span style={loginStyles.prefix}>+91</span>
                            )}
                            <input
                                id="identifier"
                                name="identifier"
                                type={loginMode === "phone" ? "tel" : "email"}
                                required
                                placeholder={
                                    loginMode === "phone"
                                        ? "Enter 10-digit mobile number"
                                        : "Enter your registered email"
                                }
                                value={identifier}
                                onChange={handleIdentifierChange}
                                style={loginStyles.input}
                            />
                        </div>
                    </div>

                    {/* Password Input Box */}
                    <div style={loginStyles.inputGroup}>
                        <div style={loginStyles.inputBox}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                style={loginStyles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={loginStyles.showPasswordBtn}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div style={loginStyles.forgotPasswordRow}>
                        <Link to="/forgot-password" style={loginStyles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...loginStyles.submitBtn,
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? "not-allowed" : "pointer"
                        }}
                    >
                        {submitting ? "Signing in..." : "Continue"}
                    </button>
                </form>

                {/* Email / Phone Switcher */}
                <div style={loginStyles.toggleModeRow}>
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMode(loginMode === "phone" ? "email" : "phone");
                            setIdentifier("");
                            setError("");
                        }}
                        style={loginStyles.toggleModeBtn}
                    >
                        {loginMode === "phone"
                            ? "Use Email Address Instead"
                            : "Use Mobile Number Instead"}
                    </button>
                </div>

                {/* Disclaimer */}
                <p style={loginStyles.termsNotice}>
                    By continuing, you agree to MyStore's{" "}
                    <span style={{ color: "#2874f0", cursor: "pointer" }}>Conditions of Use</span> and{" "}
                    <span style={{ color: "#2874f0", cursor: "pointer" }}>Privacy Notice</span>.
                </p>

                <div style={loginStyles.dividerLine} />

                {/* Registration CTA */}
                <div style={loginStyles.footer}>
                    <span style={loginStyles.footerText}>New to MyStore?</span>
                    <Link to="/register" style={loginStyles.registerLink}>
                        Create your MyStore account
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
        margin: 0,
        lineHeight: 1.45
    },
    errorBanner: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        padding: "9px 12px",
        borderRadius: "4px",
        fontSize: "0.82rem",
        marginBottom: "14px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column"
    },
    inputBox: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ffffff",
        border: "1.5px solid #cbd5e1",
        borderRadius: "4px",
        padding: "0 12px",
        height: "44px",
        boxSizing: "border-box"
    },
    prefix: {
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#64748b",
        marginRight: "8px",
        borderRight: "1px solid #cbd5e1",
        paddingRight: "8px"
    },
    input: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "0.92rem",
        color: "#0f172a",
        outline: "none"
    },
    showPasswordBtn: {
        background: "none",
        border: "none",
        color: "#0284c7",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        padding: "0 4px"
    },
    forgotPasswordRow: {
        display: "flex",
        justifyContent: "flex-end"
    },
    forgotLink: {
        fontSize: "0.82rem",
        color: "#2874f0",
        textDecoration: "none",
        fontWeight: 600
    },
    submitBtn: {
        width: "100%",
        height: "44px",
        backgroundColor: "#fb641b",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        fontSize: "0.92rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        boxShadow: "0 2px 6px rgba(251, 100, 27, 0.3)"
    },
    toggleModeRow: {
        marginTop: "16px",
        textAlign: "center"
    },
    toggleModeBtn: {
        background: "none",
        border: "none",
        color: "#064e3b",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
        textDecoration: "underline"
    },
    termsNotice: {
        fontSize: "0.75rem",
        color: "#64748b",
        margin: "18px 0 0 0",
        textAlign: "center",
        lineHeight: 1.4
    },
    dividerLine: {
        height: "1px",
        backgroundColor: "#e2e8f0",
        margin: "20px 0 16px 0"
    },
    footer: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        textAlign: "center"
    },
    footerText: {
        fontSize: "0.82rem",
        color: "#64748b"
    },
    registerLink: {
        display: "inline-block",
        padding: "8px 0",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        color: "#0f172a",
        fontWeight: 600,
        fontSize: "0.86rem",
        textDecoration: "none"
    }
};