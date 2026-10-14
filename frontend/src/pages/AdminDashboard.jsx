import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security Check
  useEffect(() => {
    if (user && user.role !== "admin" && !user.roles?.includes("admin")) {
      toast.error("Unauthorized Access");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        if (activeTab === "overview") {
          const res = await API.get("/users/admin/stats");
          setStats(
            res.data.data || {
              totalUsers: 0,
              totalProducts: 0,
              totalOrders: 0,
              totalRevenue: 0,
            },
          );
        } else if (activeTab === "users") {
          const res = await API.get("/users/admin/users");
          setUsersList(res.data.data || []);
        }
      } catch (err) {
        // Silently handle backend errors for tabs that might not exist yet
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" || user?.roles?.includes("admin")) {
      fetchAdminData();
    }
  }, [activeTab, user]);

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm("Are you sure you want to completely delete this user?")
    )
      return;
    try {
      await API.delete(`/users/${userId}`);
      setUsersList(usersList.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting user");
    }
  };

  // --- PLACEHOLDER DATA FOR NEW TABS (Ready to be replaced with real API calls) ---
  const mockApprovals = [
    {
      _id: "1",
      storeName: "Gadget Hub",
      owner: "Ravi Kumar",
      appliedOn: "2026-09-22",
      status: "Pending Verification",
    },
  ];
  const mockOrders = [
    {
      _id: "ORD-9921",
      customer: "Anurag Singh",
      items: 3,
      total: 65400,
      status: "Processing",
      date: "2026-09-24",
    },
    {
      _id: "ORD-9920",
      customer: "Priya M.",
      items: 1,
      total: 1200,
      status: "Shipped",
      date: "2026-09-23",
    },
  ];
  const mockProducts = [
    {
      _id: "P-101",
      title: "Sony WH-1000XM5",
      seller: "TechElectro",
      price: 26990,
      stock: 15,
      reported: false,
    },
    {
      _id: "P-102",
      title: "Fake Gucci Bag (Counterfeit)",
      seller: "ShadySeller99",
      price: 500,
      stock: 100,
      reported: true,
    },
  ];
  const mockCategories = [
    "For You",
    "Men",
    "Women",
    "Mobiles",
    "Electronics",
    "Beauty",
    "Home",
    "Appliances",
    "Books",
  ];
  const mockPromos = [
    {
      code: "DIWALI50",
      discount: "50%",
      maxUses: 1000,
      used: 432,
      expires: "2026-11-10",
      active: true,
    },
    {
      code: "FREESHIP",
      discount: "Free Shipping",
      maxUses: 500,
      used: 500,
      expires: "2026-10-01",
      active: false,
    },
  ];

  if (
    loading &&
    !stats.totalUsers &&
    usersList.length === 0 &&
    activeTab === "overview"
  ) {
    return <div style={styles.center}>Loading Admin Command Center...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontSize: "1.8rem" }}>👑</span>
          <h2 style={styles.sidebarTitle}>Super Admin</h2>
        </div>
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab("overview")}
            style={getNavStyle(activeTab, "overview")}
          >
            📊 Platform Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            style={getNavStyle(activeTab, "users")}
          >
            👥 User Management
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            style={getNavStyle(activeTab, "approvals")}
          >
            🛡️ Seller Approvals
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            style={getNavStyle(activeTab, "orders")}
          >
            📦 Global Orders
          </button>
          <button
            onClick={() => setActiveTab("products")}
            style={getNavStyle(activeTab, "products")}
          >
            🛑 Moderation
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            style={getNavStyle(activeTab, "categories")}
          >
            📑 Categories & UI
          </button>
          <button
            onClick={() => setActiveTab("promos")}
            style={getNavStyle(activeTab, "promos")}
          >
            🎟️ Promo Codes
          </button>
        </nav>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.headerRow}>
          <h1 style={styles.pageTitle}>
            {activeTab === "overview" && "Platform Overview"}
            {activeTab === "users" && "Manage Users"}
            {activeTab === "approvals" && "Seller Verifications"}
            {activeTab === "orders" && "Global Order Tracking"}
            {activeTab === "products" && "Product Moderation"}
            {activeTab === "categories" && "Homepage & Categories"}
            {activeTab === "promos" && "Discount Campaigns"}
          </h1>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderTop: "4px solid #3b82f6" }}>
              <div style={styles.statLabel}>Total Users</div>
              <div style={styles.statValue}>
                {stats.totalUsers.toLocaleString()}
              </div>
            </div>
            <div style={{ ...styles.statCard, borderTop: "4px solid #10b981" }}>
              <div style={styles.statLabel}>Active Products</div>
              <div style={styles.statValue}>
                {stats.totalProducts.toLocaleString()}
              </div>
            </div>
            <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
              <div style={styles.statLabel}>Total Orders</div>
              <div style={styles.statValue}>
                {stats.totalOrders.toLocaleString()}
              </div>
            </div>
            <div style={{ ...styles.statCard, borderTop: "4px solid #8b5cf6" }}>
              <div style={styles.statLabel}>Delivered Revenue</div>
              <div style={styles.statValue}>
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS TAB */}
        {activeTab === "users" && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email / Phone</th>
                  <th style={styles.th}>Roles</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{u.name}</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "500" }}>
                        {u.email || "No Email"}
                      </div>
                      {u.phone && (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.85rem",
                            marginTop: "2px",
                          }}
                        >
                          📞 {u.phone}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {u.roles?.map((role) => (
                          <span key={role} style={getRoleBadgeStyle(role)}>
                            {role.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u.roles?.includes("admin")}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          opacity: u.roles?.includes("admin") ? 0.5 : 1,
                        }}
                      >
                        Ban / Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. SELLER APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Store Name</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Applied On</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockApprovals.map((app) => (
                  <tr key={app._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{app.storeName}</strong>
                    </td>
                    <td style={styles.td}>{app.owner}</td>
                    <td style={styles.td}>{app.appliedOn}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          color: "#d97706",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          backgroundColor: "#fef3c7",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#ecfdf5",
                            color: "#059669",
                            border: "1px solid #a7f3d0",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. GLOBAL ORDERS TAB */}
        {activeTab === "orders" && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((ord) => (
                  <tr key={ord._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{ord._id}</strong>
                    </td>
                    <td style={styles.td}>{ord.customer}</td>
                    <td style={styles.td}>
                      ₹{ord.total.toLocaleString("en-IN")}
                    </td>
                    <td style={styles.td}>
                      <strong>{ord.status}</strong>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PRODUCT MODERATION TAB */}
        {activeTab === "products" && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Product Title</th>
                  <th style={styles.th}>Seller</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Flags</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((prod) => (
                  <tr key={prod._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{prod.title}</strong>
                    </td>
                    <td style={styles.td}>{prod.seller}</td>
                    <td style={styles.td}>
                      ₹{prod.price.toLocaleString("en-IN")}
                    </td>
                    <td style={styles.td}>
                      {prod.reported ? (
                        <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                          🚨 Reported
                        </span>
                      ) : (
                        <span style={{ color: "#10b981" }}>Clear</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                        }}
                      >
                        Force Unpublish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. CATEGORIES & HOMEPAGE TAB */}
        {activeTab === "categories" && (
          <div
            style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>
                Active Global Categories
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "16px",
                }}
              >
                {mockCategories.map((cat) => (
                  <div
                    key={cat}
                    style={{
                      backgroundColor: "#f1f5f9",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      fontSize: "0.9rem",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {cat}{" "}
                    <span style={{ cursor: "pointer", color: "#94a3b8" }}>
                      ✕
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="New Category Name"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
                <button
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "0 16px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. PROMO CODES TAB */}
        {activeTab === "promos" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <button
                style={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                + Create New Campaign
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Discount</th>
                    <th style={styles.th}>Usage</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPromos.map((promo) => (
                    <tr key={promo.code} style={styles.tableRow}>
                      <td style={styles.td}>
                        <strong
                          style={{
                            letterSpacing: "1px",
                            backgroundColor: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {promo.code}
                        </strong>
                      </td>
                      <td style={styles.td}>{promo.discount}</td>
                      <td style={styles.td}>
                        {promo.used} / {promo.maxUses} uses
                      </td>
                      <td style={styles.td}>
                        {promo.active ? (
                          <span
                            style={{ color: "#10b981", fontWeight: "bold" }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{ color: "#94a3b8", fontWeight: "bold" }}
                          >
                            Expired
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          Edit / Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for dynamic navigation styles
const getNavStyle = (activeTab, tabName) => ({
  padding: "14px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: activeTab === tabName ? "700" : "600",
  fontSize: "0.95rem",
  textAlign: "left",
  transition: "all 0.2s",
  backgroundColor: activeTab === tabName ? "#eff6ff" : "transparent",
  color: activeTab === tabName ? "#2563eb" : "#475569",
});

// Helper function for Role Badges
const getRoleBadgeStyle = (role) => ({
  padding: "3px 10px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "700",
  backgroundColor:
    role === "admin" ? "#fef2f2" : role === "seller" ? "#fef3c7" : "#f1f5f9",
  color:
    role === "admin" ? "#dc2626" : role === "seller" ? "#d97706" : "#475569",
});

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  sidebarTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  nav: { display: "flex", flexDirection: "column", gap: "6px" },
  mainContent: { flex: 1, padding: "32px", overflowY: "auto" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "2.2rem",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-1px",
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background 0.2s",
  },
  td: {
    padding: "16px",
    fontSize: "0.95rem",
    color: "#334155",
    verticalAlign: "middle",
  },
  actionBtn: {
    padding: "6px 14px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  center: {
    padding: "100px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "1.1rem",
  },
};
