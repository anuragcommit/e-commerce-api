// src/pages/BecomeSellerPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function BecomeSellerPage() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpgrade = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await API.post("/users/become-seller");
            const updatedUser = res.data.data.user;

            // Preserve existing token while updating the local user profile
            const token = localStorage.getItem("accessToken");
            login(token, updatedUser);

            alert("Congratulations! Your seller account is now active.");
            navigate("/seller/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upgrade. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.iconBadge}>💼</div>
                <h1 style={styles.title}>Start Selling on MyStore</h1>
                <p style={styles.subtitle}>
                    Reach millions of customers, manage your inventory, and grow your business with zero upfront fees.
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <div style={styles.featureList}>
                    <div style={styles.featureItem}>
                        <span style={styles.check}>✓</span>
                        <div>
                            <strong>Access to Seller Hub:</strong> Add and edit your own product listings.
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <span style={styles.check}>✓</span>
                        <div>
                            <strong>Unified Account:</strong> Continue shopping as a customer with the same login.
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <span style={styles.check}>✓</span>
                        <div>
                            <strong>Real-time Analytics:</strong> Track your sales and customer orders easily.
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{
                        ...styles.btn,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Activating Seller Hub..." : "Activate Seller Account"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        padding: "24px 16px"
    },
    card: {
        width: "100%",
        maxWidth: "500px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "36px 28px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
    },
    iconBadge: {
        fontSize: "2.5rem",
        marginBottom: "12px"
    },
    title: {
        fontSize: "1.45rem",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 8px 0"
    },
    subtitle: {
        fontSize: "0.88rem",
        color: "#64748b",
        lineHeight: 1.5,
        margin: "0 0 24px 0"
    },
    featureList: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        textAlign: "left",
        marginBottom: "28px"
    },
    featureItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "0.85rem",
        color: "#334155"
    },
    check: {
        color: "#10b981",
        fontWeight: "800"
    },
    btn: {
        width: "100%",
        padding: "13px",
        backgroundColor: "#fb641b",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontWeight: "700",
        fontSize: "0.95rem"
    },
    errorBox: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "0.82rem",
        marginBottom: "16px"
    }
};