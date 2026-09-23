// src/pages/MyProfilePage.jsx
import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const BLANK_ADDRESS = {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
};

const BLANK_PASSWORD = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
};

export default function MyProfilePage() {
    const { login } = useAuth();

    // Navigation & View State: "personal" | "addresses" | "security"
    const [activeTab, setActiveTab] = useState("personal");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });

    // Address Management State
    const [addresses, setAddresses] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState(BLANK_ADDRESS);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState(BLANK_PASSWORD);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    // Fetch initial profile and address details
    const fetchUserData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/users/profile");
            const userData = res.data?.data;
            if (userData) {
                setPersonalInfo({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || ""
                });
                setAddresses(userData.address || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const resetFeedback = () => {
        setError("");
        setSuccessMsg("");
    };

    // 1. Save Personal Details
    const handleSavePersonalInfo = async (e) => {
        e.preventDefault();
        setSaving(true);
        resetFeedback();

        try {
            const res = await API.patch("/users/update-profile", personalInfo);
            const updatedUser = res.data?.data;

            const currentToken = localStorage.getItem("accessToken");
            login(currentToken, updatedUser);

            setSuccessMsg("Profile details updated successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    // 2. Open Address Modal / Sub-form
    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm(BLANK_ADDRESS);
        setIsFormOpen(true);
        resetFeedback();
    };

    const handleOpenEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            postalCode: addr.postalCode || "",
            country: addr.country || "India"
        });
        setIsFormOpen(true);
        resetFeedback();
    };

    // 3. Save or Update Address
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        resetFeedback();

        try {
            let res;
            if (editingAddressId) {
                res = await API.patch(`/users/address/${editingAddressId}`, addressForm);
                setSuccessMsg("Address updated successfully!");
            } else {
                res = await API.post("/users/address", addressForm);
                setSuccessMsg("Address added successfully!");
            }

            setAddresses(res.data?.data || []);
            setIsFormOpen(false);
            setEditingAddressId(null);
            setAddressForm(BLANK_ADDRESS);
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save address.");
        } finally {
            setSaving(false);
        }
    };

    // 4. Delete Address
    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await API.delete(`/users/address/${addressId}`);
            setAddresses(res.data?.data || []);
            if (editingAddressId === addressId) {
                setIsFormOpen(false);
                setEditingAddressId(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete address.");
        }
    };

    // 5. Change Password Handler
    const handleChangePassword = async (e) => {
        e.preventDefault();
        resetFeedback();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        setSaving(true);
        try {
            await API.post("/users/update-password", {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });

            setSuccessMsg("Password changed successfully! Keep your new credentials safe.");
            setPasswordForm(BLANK_PASSWORD);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.viewport}>
            <div style={styles.container}>
                {/* Left Sidebar */}
                <div style={styles.sidebar}>
                    <div style={styles.profileBadge}>
                        <div style={styles.avatar}>
                            {personalInfo.name ? personalInfo.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                            <span style={styles.badgeHello}>Hello,</span>
                            <h3 style={styles.badgeName}>{personalInfo.name || "User"}</h3>
                        </div>
                    </div>

                    <div style={styles.navMenu}>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("personal");
                                resetFeedback();
                            }}
                            style={{
                                ...styles.tabBtn,
                                color: activeTab === "personal" ? "#065f46" : "#475569",
                                backgroundColor: activeTab === "personal" ? "#ecfdf5" : "transparent",
                                fontWeight: activeTab === "personal" ? 700 : 500
                            }}
                        >
                            👤 Personal Information
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("addresses");
                                resetFeedback();
                            }}
                            style={{
                                ...styles.tabBtn,
                                color: activeTab === "addresses" ? "#065f46" : "#475569",
                                backgroundColor: activeTab === "addresses" ? "#ecfdf5" : "transparent",
                                fontWeight: activeTab === "addresses" ? 700 : 500
                            }}
                        >
                            📍 Manage Addresses
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("security");
                                resetFeedback();
                            }}
                            style={{
                                ...styles.tabBtn,
                                color: activeTab === "security" ? "#065f46" : "#475569",
                                backgroundColor: activeTab === "security" ? "#ecfdf5" : "transparent",
                                fontWeight: activeTab === "security" ? 700 : 500
                            }}
                        >
                            🔒 Security & Password
                        </button>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div style={styles.contentCard}>
                    {loading ? (
                        <p style={{ color: "#64748b" }}>Loading profile details...</p>
                    ) : (
                        <>
                            {error && <div style={styles.errorBanner}>{error}</div>}
                            {successMsg && <div style={styles.successBanner}>{successMsg}</div>}

                            {/* TAB 1: Personal Information */}
                            {activeTab === "personal" && (
                                <div>
                                    <h2 style={styles.sectionHeading}>Personal Information</h2>
                                    <form onSubmit={handleSavePersonalInfo} style={styles.form}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={personalInfo.name}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                                                }
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={personalInfo.email}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                                                }
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Mobile Number</label>
                                            <input
                                                type="tel"
                                                required
                                                value={personalInfo.phone}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                                                }
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={{ marginTop: "12px" }}>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                style={styles.saveBtn}
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* TAB 2: Addresses */}
                            {activeTab === "addresses" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                                        <h2 style={styles.sectionHeading}>Saved Addresses</h2>
                                        {!isFormOpen && (
                                            <button
                                                type="button"
                                                onClick={handleOpenAddAddress}
                                                style={styles.addAddressBtn}
                                            >
                                                + Add New Address
                                            </button>
                                        )}
                                    </div>

                                    {/* Add / Edit Form Accordion */}
                                    {isFormOpen && (
                                        <div style={styles.addressFormBox}>
                                            <h3 style={{ fontSize: "1rem", margin: "0 0 14px 0", color: "#0f172a" }}>
                                                {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                                            </h3>
                                            <form onSubmit={handleSaveAddress} style={styles.form}>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Street Address / House No. *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Flat 302, Green Valley Apartments"
                                                        value={addressForm.street}
                                                        onChange={(e) =>
                                                            setAddressForm({ ...addressForm, street: e.target.value })
                                                        }
                                                        style={styles.input}
                                                    />
                                                </div>

                                                <div style={styles.row}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>City *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="City"
                                                            value={addressForm.city}
                                                            onChange={(e) =>
                                                                setAddressForm({ ...addressForm, city: e.target.value })
                                                            }
                                                            style={styles.input}
                                                        />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>State *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="State"
                                                            value={addressForm.state}
                                                            onChange={(e) =>
                                                                setAddressForm({ ...addressForm, state: e.target.value })
                                                            }
                                                            style={styles.input}
                                                        />
                                                    </div>
                                                </div>

                                                <div style={styles.row}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Postal Code / PIN *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="6-digit PIN"
                                                            value={addressForm.postalCode}
                                                            onChange={(e) =>
                                                                setAddressForm({ ...addressForm, postalCode: e.target.value })
                                                            }
                                                            style={styles.input}
                                                        />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Country</label>
                                                        <input
                                                            type="text"
                                                            disabled
                                                            value={addressForm.country}
                                                            style={{ ...styles.input, backgroundColor: "#f8fafc" }}
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                                    <button type="submit" disabled={saving} style={styles.saveBtn}>
                                                        {saving
                                                            ? "Saving..."
                                                            : editingAddressId
                                                            ? "Update Address"
                                                            : "Save Address"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsFormOpen(false);
                                                            setEditingAddressId(null);
                                                        }}
                                                        style={styles.cancelBtn}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* List of Saved Addresses */}
                                    {addresses.length === 0 && !isFormOpen ? (
                                        <p style={{ color: "#64748b", margin: "20px 0" }}>
                                            No addresses saved yet. Click "+ Add New Address" above.
                                        </p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {addresses.map((addr) => (
                                                <div key={addr._id} style={styles.addressCard}>
                                                    <div>
                                                        <p style={{ margin: "0 0 4px 0", fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                                                            {personalInfo.name}
                                                        </p>
                                                        <p style={{ margin: "0 0 4px 0", color: "#475569", fontSize: "0.88rem" }}>
                                                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                                                        </p>
                                                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>
                                                            Phone: {personalInfo.phone}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditAddress(addr)}
                                                            style={styles.editAddrBtn}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAddress(addr._id)}
                                                            style={styles.deleteAddrBtn}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: Security & Password */}
                            {activeTab === "security" && (
                                <div>
                                    <h2 style={styles.sectionHeading}>Security & Password</h2>
                                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "-12px 0 20px 0" }}>
                                        Ensure your account uses a strong password with at least 6 characters.
                                    </p>

                                    <form onSubmit={handleChangePassword} style={{ ...styles.form, maxWidth: "480px" }}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Current Password *</label>
                                            <div style={styles.passwordWrapper}>
                                                <input
                                                    type={showOldPass ? "text" : "password"}
                                                    required
                                                    placeholder="Enter current password"
                                                    value={passwordForm.oldPassword}
                                                    onChange={(e) =>
                                                        setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                                                    }
                                                    style={styles.passwordInput}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPass(!showOldPass)}
                                                    style={styles.toggleVisibilityBtn}
                                                >
                                                    {showOldPass ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>New Password * (min 6 characters)</label>
                                            <div style={styles.passwordWrapper}>
                                                <input
                                                    type={showNewPass ? "text" : "password"}
                                                    required
                                                    minLength={6}
                                                    placeholder="Enter new password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) =>
                                                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                                    }
                                                    style={styles.passwordInput}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                    style={styles.toggleVisibilityBtn}
                                                >
                                                    {showNewPass ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Confirm New Password *</label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="Re-enter new password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                                }
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={{ marginTop: "12px" }}>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                style={styles.saveBtn}
                                            >
                                                {saving ? "Updating..." : "Update Password"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    viewport: {
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        backgroundColor: "#f1f5f9",
        padding: "24px 20px",
        boxSizing: "border-box"
    },
    container: {
        maxWidth: "1050px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        alignItems: "flex-start"
    },
    sidebar: {
        flex: "1 1 280px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    profileBadge: {
        backgroundColor: "#ffffff",
        padding: "16px 20px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },
    avatar: {
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        backgroundColor: "#34d399",
        color: "#064e3b",
        fontSize: "1.2rem",
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    badgeHello: {
        fontSize: "0.75rem",
        color: "#64748b",
        display: "block"
    },
    badgeName: {
        margin: 0,
        fontSize: "1.05rem",
        color: "#0f172a",
        fontWeight: 700
    },
    navMenu: {
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    tabBtn: {
        border: "none",
        textAlign: "left",
        padding: "14px 20px",
        fontSize: "0.9rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderBottom: "1px solid #f1f5f9",
        transition: "all 0.15s ease"
    },
    contentCard: {
        flex: "1 1 650px",
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        padding: "24px 30px",
        boxSizing: "border-box"
    },
    sectionHeading: {
        fontSize: "1.2rem",
        fontWeight: 800,
        color: "#0f172a",
        margin: "0 0 20px 0"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    row: {
        display: "flex",
        gap: "14px",
        flexWrap: "wrap"
    },
    formGroup: {
        flex: 1,
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    label: {
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#334155"
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "4px",
        border: "1.5px solid #cbd5e1",
        fontSize: "0.9rem",
        color: "#0f172a",
        outline: "none",
        boxSizing: "border-box"
    },
    passwordWrapper: {
        display: "flex",
        alignItems: "center",
        border: "1.5px solid #cbd5e1",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        paddingRight: "10px"
    },
    passwordInput: {
        width: "100%",
        padding: "10px 12px",
        border: "none",
        outline: "none",
        fontSize: "0.9rem",
        color: "#0f172a",
        backgroundColor: "transparent"
    },
    toggleVisibilityBtn: {
        background: "none",
        border: "none",
        color: "#0284c7",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer"
    },
    saveBtn: {
        backgroundColor: "#fb641b",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        padding: "10px 24px",
        fontSize: "0.9rem",
        fontWeight: 700,
        cursor: "pointer"
    },
    cancelBtn: {
        backgroundColor: "transparent",
        color: "#475569",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        padding: "10px 20px",
        fontSize: "0.9rem",
        cursor: "pointer"
    },
    addAddressBtn: {
        backgroundColor: "#f8fafc",
        border: "1.5px solid #065f46",
        color: "#065f46",
        padding: "8px 16px",
        borderRadius: "4px",
        fontSize: "0.85rem",
        fontWeight: 700,
        cursor: "pointer"
    },
    addressFormBox: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        padding: "20px",
        marginBottom: "20px"
    },
    addressCard: {
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff"
    },
    editAddrBtn: {
        background: "none",
        border: "none",
        color: "#0284c7",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer"
    },
    deleteAddrBtn: {
        background: "none",
        border: "none",
        color: "#dc2626",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer"
    },
    errorBanner: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        padding: "10px 14px",
        borderRadius: "4px",
        marginBottom: "16px",
        fontSize: "0.85rem"
    },
    successBanner: {
        backgroundColor: "#ecfdf5",
        color: "#065f46",
        padding: "10px 14px",
        borderRadius: "4px",
        marginBottom: "16px",
        fontSize: "0.85rem"
    }
};