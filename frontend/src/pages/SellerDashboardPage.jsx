// src/pages/SellerDashboardPage.jsx
import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const INITIAL_FORM = {
    title: "",
    brand: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    imageUrl: "",
    description: ""
};

export default function SellerDashboardPage() {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [prodRes, catRes] = await Promise.all([
                API.get("/products/seller/my-products"),
                API.get("/categories/")
            ]);
            setProducts(prodRes.data?.data || []);
            setCategories(catRes.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load seller catalog.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenCreate = () => {
        setEditingProductId(null);
        setFormData(INITIAL_FORM);
        setError("");
        setModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProductId(product._id);
        setFormData({
            title: product.title || "",
            brand: product.brand || "",
            category: product.category?._id || product.category || "",
            price: product.price || "",
            originalPrice: product.originalPrice || "",
            stock: product.stock ?? "",
            imageUrl: product.images?.[0] || "",
            description: product.description || ""
        });
        setError("");
        setModalOpen(true);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const payload = {
            title: formData.title,
            brand: formData.brand || "Generic",
            category: formData.category,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice) || Number(formData.price),
            stock: Number(formData.stock) || 0,
            description: formData.description,
            images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : []
        };

        try {
            if (editingProductId) {
                // Update existing listing
                await API.patch(`/products/${editingProductId}`, payload);
            } else {
                // Create new listing
                await API.post("/products/create-product", payload);
            }

            setModalOpen(false);
            setFormData(INITIAL_FORM);
            setEditingProductId(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await API.delete(`/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p._id !== productId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete product.");
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.heading}>Seller Central</h1>
                    <p style={styles.subheading}>Manage your active inventory and publish new catalog items.</p>
                </div>
                <button type="button" onClick={handleOpenCreate} style={styles.primaryBtn}>
                    + Add New Product
                </button>
            </div>

            {/* Quick Metrics */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Listings</span>
                    <span style={styles.statValue}>{products.length}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>In-Stock Units</span>
                    <span style={styles.statValue}>
                        {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
                    </span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Seller Account</span>
                    <span style={{ ...styles.statValue, fontSize: "1.1rem", color: "#065f46" }}>
                        {user?.name || "Verified Merchant"}
                    </span>
                </div>
            </div>

            {/* Catalog Table */}
            <div style={styles.tableCard}>
                <h3 style={styles.tableTitle}>Active Catalog</h3>

                {loading ? (
                    <p style={{ padding: "20px", color: "#64748b" }}>Loading your catalog...</p>
                ) : products.length === 0 ? (
                    <div style={styles.emptyNotice}>
                        <p style={{ fontSize: "1.8rem", margin: "0 0 6px 0" }}>📦</p>
                        <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>No products listed yet.</p>
                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                            Click "+ Add New Product" to put your items in the store.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Product</th>
                                    <th style={styles.th}>Category</th>
                                    <th style={styles.th}>Price</th>
                                    <th style={styles.th}>Stock</th>
                                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <img
                                                    src={p.images?.[0] || "https://placehold.co/50x50"}
                                                    alt={p.title}
                                                    style={styles.thumb}
                                                />
                                                <div>
                                                    <span style={styles.productTitle}>{p.title}</span>
                                                    <span style={styles.productBrand}>{p.brand}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{p.category?.name || "General"}</span>
                                        </td>
                                        <td style={styles.td}>₹{p.price?.toLocaleString("en-IN")}</td>
                                        <td style={styles.td}>
                                            <span style={{ color: p.stock < 5 ? "#dc2626" : "#059669", fontWeight: 700 }}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: "right" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(p)}
                                                style={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p._id)}
                                                style={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                                {editingProductId ? "Edit Product Listing" : "Add New Listing"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                style={styles.closeBtn}
                            >
                                ✕
                            </button>
                        </div>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <form onSubmit={handleSubmitProduct} style={styles.modalForm}>
                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Product Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Wireless Headphones"
                                        value={formData.title}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Brand Name</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        placeholder="e.g. Sony, Apple"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Category *</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        style={styles.input}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Stock Quantity *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Selling Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Original MRP (₹)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        min="0"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={styles.label}>Product Image URL</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{ ...styles.input, resize: "vertical" }}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={styles.primaryBtn}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingProductId
                                        ? "Update Product"
                                        : "Publish Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "1150px",
        margin: "0 auto",
        padding: "24px 20px",
        boxSizing: "border-box"
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px"
    },
    heading: {
        fontSize: "1.5rem",
        fontWeight: 800,
        color: "#0f172a",
        margin: 0
    },
    subheading: {
        fontSize: "0.88rem",
        color: "#64748b",
        margin: "4px 0 0 0"
    },
    primaryBtn: {
        backgroundColor: "#fb641b",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        padding: "10px 20px",
        fontWeight: 700,
        fontSize: "0.9rem",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(251, 100, 27, 0.3)"
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
    },
    statCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    statLabel: {
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase"
    },
    statValue: {
        fontSize: "1.6rem",
        fontWeight: 800,
        color: "#0f172a"
    },
    tableCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        overflow: "hidden"
    },
    tableTitle: {
        margin: 0,
        padding: "16px 20px",
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "#0f172a",
        borderBottom: "1px solid #e2e8f0"
    },
    emptyNotice: {
        textAlign: "center",
        padding: "48px 20px"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.88rem"
    },
    th: {
        textAlign: "left",
        padding: "12px 18px",
        backgroundColor: "#f8fafc",
        color: "#475569",
        fontWeight: 700,
        borderBottom: "1px solid #e2e8f0"
    },
    tr: {
        borderBottom: "1px solid #f1f5f9"
    },
    td: {
        padding: "14px 18px",
        color: "#1e293b",
        verticalAlign: "middle"
    },
    thumb: {
        width: "44px",
        height: "44px",
        objectFit: "contain",
        backgroundColor: "#f1f5f9",
        borderRadius: "4px"
    },
    productTitle: {
        display: "block",
        fontWeight: 600,
        color: "#0f172a"
    },
    productBrand: {
        fontSize: "0.75rem",
        color: "#64748b"
    },
    badge: {
        backgroundColor: "#e2e8f0",
        color: "#334155",
        padding: "3px 8px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 600
    },
    editBtn: {
        background: "none",
        border: "none",
        color: "#0284c7",
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer",
        marginRight: "14px"
    },
    deleteBtn: {
        background: "none",
        border: "none",
        color: "#dc2626",
        fontWeight: 700,
        fontSize: "0.82rem",
        cursor: "pointer"
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "16px"
    },
    modalCard: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "24px",
        boxSizing: "border-box"
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    closeBtn: {
        background: "none",
        border: "none",
        fontSize: "1.2rem",
        color: "#64748b",
        cursor: "pointer"
    },
    errorAlert: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "0.82rem",
        marginBottom: "14px"
    },
    modalForm: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    formRow: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },
    formCol: {
        flex: 1,
        minWidth: "200px"
    },
    label: {
        display: "block",
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#334155",
        marginBottom: "4px"
    },
    input: {
        width: "100%",
        border: "1.5px solid #cbd5e1",
        borderRadius: "4px",
        padding: "8px 10px",
        fontSize: "0.88rem",
        color: "#0f172a",
        outline: "none",
        boxSizing: "border-box"
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "10px"
    },
    cancelBtn: {
        background: "none",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        padding: "10px 16px",
        fontSize: "0.88rem",
        color: "#475569",
        cursor: "pointer"
    }
};