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
    role: "customer",
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
      setError(
        "Please enter a valid 10-digit Indian mobile number (starts with 6-9).",
      );
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
      // Robust error parser that inspects every layer of the API response
      let backendMessage = "";

      if (err.response?.data) {
        const data = err.response.data;
        if (data.message) {
          backendMessage = data.message;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          backendMessage = data.errors.join(", ");
        } else if (typeof data === "string") {
          backendMessage = data;
        }
      } else if (err.request) {
        backendMessage =
          "Server unreachable. Please verify your backend is running on port 8000.";
      } else {
        backendMessage = err.message || "An unexpected error occurred.";
      }

      setError(backendMessage);
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
          <div style={ui.title}>Sign Up</div>
          <p style={ui.subtitle}>
            Get started in seconds with your store account.
          </p>
        </div>

        {/* Role Switcher */}
        <div style={ui.roleContainer}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "customer" })}
            style={{
              ...ui.roleButton,
              backgroundColor:
                formData.role === "customer" ? "#ffffff" : "transparent",
              color: formData.role === "customer" ? "#0f172a" : "#64748b",
              boxShadow:
                formData.role === "customer"
                  ? "0 2px 6px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            🛍️ Customer
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "seller" })}
            style={{
              ...ui.roleButton,
              backgroundColor:
                formData.role === "seller" ? "#ffffff" : "transparent",
              color: formData.role === "seller" ? "#0f172a" : "#64748b",
              boxShadow:
                formData.role === "seller"
                  ? "0 2px 6px rgba(0,0,0,0.08)"
                  : "none",
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
              <div
                style={{
                  ...ui.inputContainer,
                  borderColor: focusedField === "name" ? "#2563eb" : "#e2e8f0",
                }}
              >
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
                <span
                  style={{
                    ...ui.counter,
                    color: formData.phone.length === 10 ? "#16a34a" : "#94a3b8",
                  }}
                >
                  {formData.phone.length}/10
                </span>
              </div>
              <div
                style={{
                  ...ui.inputContainer,
                  borderColor: focusedField === "phone" ? "#2563eb" : "#e2e8f0",
                }}
              >
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
            <div
              style={{
                ...ui.inputContainer,
                borderColor: focusedField === "email" ? "#2563eb" : "#e2e8f0",
              }}
            >
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
            <div
              style={{
                ...ui.inputContainer,
                borderColor:
                  focusedField === "password" ? "#2563eb" : "#e2e8f0",
              }}
            >
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
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Creating account..."
              : `Sign Up as ${formData.role === "seller" ? "Seller" : "Customer"}`}
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
        backgroundColor: "#f1f3f6", // Crisp Flipkart light background
        padding: "20px 16px",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    },
    card: {
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "32px 28px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box"
    },
    header: {
        marginBottom: "18px",
        textAlign: "center"
    },
    brandLogo: {
        fontSize: "1.4rem",
        fontWeight: "800",
        letterSpacing: "-0.02em",
        marginBottom: "6px"
    },
    title: {
        fontSize: "1.45rem",
        fontWeight: "600",
        color: "#0f1111", // Amazon deep charcoal
        margin: "0 0 4px 0"
    },
    subtitle: {
        fontSize: "0.82rem",
        color: "#565959",
        margin: 0
    },
    roleContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        backgroundColor: "#f7f8f8",
        border: "1px solid #e7e7e7",
        borderRadius: "6px",
        padding: "3px",
        gap: "4px",
        marginBottom: "16px"
    },
    roleButton: {
        padding: "8px",
        border: "none",
        borderRadius: "5px",
        fontSize: "0.82rem",
        cursor: "pointer",
        transition: "all 0.15s ease"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
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
        fontSize: "0.8rem",
        fontWeight: "700",
        color: "#0f1111"
    },
    counter: {
        fontSize: "0.72rem",
        fontWeight: "600"
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ffffff",
        border: "1px solid #d5d9d9",
        borderRadius: "4px", // Snappy e-commerce border radius
        padding: "0 10px",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease"
    },
    prefix: {
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "#565959",
        marginRight: "6px"
    },
    input: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        padding: "9px 0",
        fontSize: "0.88rem",
        color: "#0f1111",
        outline: "none"
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#007185",
        fontSize: "0.75rem",
        fontWeight: "600",
        cursor: "pointer",
        padding: "4px 6px"
    },
    submitBtn: {
        marginTop: "8px",
        padding: "11px",
        backgroundColor: "#fb641b", // Flipkart vibrant CTA orange
        color: "#ffffff",
        border: "1px solid #fb641b",
        borderRadius: "4px",
        fontSize: "0.92rem",
        fontWeight: "700",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
        transition: "background-color 0.15s ease"
    },
    errorBanner: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#fff4f4",
        border: "1px solid #c40000",
        borderLeft: "4px solid #c40000",
        color: "#c40000",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "0.8rem",
        marginBottom: "12px",
        textAlign: "left"
    },
    termsText: {
        fontSize: "0.72rem",
        color: "#565959",
        textAlign: "center",
        margin: "14px 0 0 0",
        lineHeight: "1.4"
    },
    footer: {
        marginTop: "16px",
        paddingTop: "14px",
        borderTop: "1px solid #e7e7e7",
        textAlign: "center",
        fontSize: "0.82rem",
        color: "#0f1111"
    },
    link: {
        color: "#007185",
        textDecoration: "none",
        cursor: "pointer"
    },
    loginLink: {
        color: "#2874f0",
        fontWeight: "700",
        textDecoration: "none"
    }
};