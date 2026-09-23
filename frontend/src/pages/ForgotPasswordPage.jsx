// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [focused, setFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSent, setIsSent] = useState(false);

    // Smart input filter:
    // If starting with digits, restrict strictly to numbers and cap at 10 digits
    const handleIdentifierChange = (e) => {
        const val = e.target.value;
        setError("");

        // If the user starts typing numbers (potential phone)
        if (/^\d+$/.test(val)) {
            const digitsOnly = val.replace(/\D/g, "");
            if (digitsOnly.length <= 10) {
                setIdentifier(digitsOnly);
            }
            return;
        }

        // Otherwise allow standard email characters
        setIdentifier(val);
    };

    // Strict validation rules
    const isPhone = /^[6-9]\d{9}$/.test(identifier.trim());
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
    const isInputValid = isPhone || isEmail;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isInputValid || submitting) return;

        setError("");
        setSubmitting(true);

        const payload = isPhone
            ? { phone: Number(identifier.trim()) }
            : { email: identifier.trim().toLowerCase() };

        try {
            await API.post("/users/forgot-password", payload);
            setIsSent(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to process recovery request. Check your input.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.viewport}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        {isSent ? "Check Your Inbox" : "Reset Password"}
                    </h1>
                    {!isSent && (
                        <p style={styles.subtitle}>
                            Enter the email address or mobile phone number associated with your MyStore account.
                        </p>
                    )}
                </div>

                {error && (
                    <div style={styles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                {isSent ? (
                    <div style={styles.successState}>
                        <div style={styles.successIcon}>✓</div>
                        <h3 style={{ color: "#065f46", margin: "16px 0 8px 0", fontSize: "1.1rem" }}>
                            Link Sent Successfully
                        </h3>
                        <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
                            We have sent password reset instructions to <strong>{identifier}</strong>. Please check your messages.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            style={styles.continueBtn}
                        >
                            Return to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={{
                            ...styles.inputBox,
                            borderColor: focused ? "#fb641b" : "#cbd5e1"
                        }}>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                placeholder="Email or 10-digit mobile number"
                                value={identifier}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                onChange={handleIdentifierChange}
                                style={styles.input}
                            />

                            {/* Show 0/10 counter only when numeric digits are entered */}
                            {/^\d+$/.test(identifier) && (
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: identifier.length === 10 ? "#10b981" : "#94a3b8",
                                    whiteSpace: "nowrap",
                                    marginLeft: "8px"
                                }}>
                                    {identifier.length}/10
                                </span>
                            )}
                        </div>

                        {/* Continue Button */}
                        <button
                            type="submit"
                            disabled={!isInputValid || submitting}
                            style={{
                                ...styles.continueBtn,
                                backgroundColor: isInputValid && !submitting ? "#fb641b" : "#cbd5e1",
                                cursor: isInputValid && !submitting ? "pointer" : "not-allowed",
                                boxShadow: isInputValid ? "0 2px 6px rgba(251, 100, 27, 0.3)" : "none"
                            }}
                        >
                            {submitting ? "Sending..." : "Continue"}
                        </button>
                    </form>
                )}

                <div style={styles.footer}>
                    Remember your password?{" "}
                    <Link to="/login" style={styles.link}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
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
    input: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "0.92rem",
        color: "#0f172a",
        outline: "none"
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
    successState: {
        textAlign: "center",
        padding: "10px 0 16px 0"
    },
    successIcon: {
        width: "48px",
        height: "48px",
        margin: "0 auto",
        backgroundColor: "#d1fae5",
        color: "#059669",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.3rem",
        fontWeight: 800
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