// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await API.patch(`/orders/cancel/${orderId}`);
      toast.success("Order cancelled and stock restored successfully!");
      fetchOrders(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error cancelling order");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return { bg: "#fff7ed", text: "#ea580c", border: "#fdba74", icon: "⏳" };
      case "shipped":
        return { bg: "#f0f9ff", text: "#0284c7", border: "#7dd3fc", icon: "🚚" };
      case "delivered":
        return { bg: "#f0fdf4", text: "#16a34a", border: "#86efac", icon: "📦" };
      case "cancelled":
        return { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5", icon: "✕" };
      default:
        return { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", icon: "●" };
    }
  };

  if (loading) return <div style={styles.center}>Loading your orders...</div>;
  if (error)
    return (
      <div style={styles.center}>
        <span style={{ color: "red" }}>{error}</span>
      </div>
    );

  return (
    <div style={styles.pageContainer}>
      {/* Injecting CSS for advanced hover effects not possible with inline styles */}
      <style>{`
        .premium-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02);
            border: 1px solid #f1f5f9;
            overflow: hidden;
            transition: box-shadow 0.3s ease;
        }
        .premium-card:hover {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
        }
        .action-btn-outline {
            border: 1px solid #cbd5e1;
            background: transparent;
            color: #475569;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .action-btn-outline:hover {
            border-color: #2563eb;
            color: #2563eb;
            background: #eff6ff;
        }
        .cancel-btn-subtle {
            background: transparent;
            color: #ef4444;
            border: 1px solid #fca5a5;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .cancel-btn-subtle:hover {
            background: #fef2f2;
            border-color: #ef4444;
        }
        .item-link {
            text-decoration: none;
            color: #1e293b;
            transition: color 0.2s;
        }
        .item-link:hover {
            color: #2563eb;
        }
      `}</style>

      <div style={styles.layout}>
        <h1 style={styles.pageTitle}>Order History</h1>

        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛍️</div>
            <h3 style={{ margin: "0 0 12px 0", color: "#0f172a" }}>No orders found</h3>
            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "0.95rem" }}>
              Looks like you haven't placed an order yet. Let's fix that!
            </p>
            <Link to="/" style={styles.shopBtn}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.orderStatus);
              return (
                <div key={order._id} className="premium-card">
                  {/* Header Segment */}
                  <div style={styles.orderHeader}>
                    <div style={styles.headerGrid}>
                      <div>
                        <span style={styles.label}>ORDER PLACED</span>
                        <div style={styles.value}>{formatDate(order.createdAt)}</div>
                      </div>
                      <div>
                        <span style={styles.label}>TOTAL</span>
                        <div style={styles.value}>
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span style={styles.label}>SHIP TO</span>
                        <div style={styles.value}>
                          {order.shippingAddress?.city},{" "}
                          {order.shippingAddress?.state}
                        </div>
                      </div>
                      <div>
                        <span style={styles.label}>ORDER ID</span>
                        <div style={{...styles.value, fontFamily: "monospace", color: "#64748b"}}>
                          #{order._id.substring(16).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Segment (Products) */}
                  <div style={styles.orderBody}>
                    <div style={styles.statusRow}>
                        <span
                            style={{
                            ...styles.statusBadge,
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            borderColor: statusStyle.border,
                            }}
                        >
                            {statusStyle.icon} {order.orderStatus.toUpperCase()}
                        </span>
                        
                        {order.orderStatus === "processing" && (
                            <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="cancel-btn-subtle"
                            >
                            Cancel Order
                            </button>
                        )}
                    </div>

                    {order.items.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        
                        <div style={styles.imageWrapper}>
                            {item.product?.images?.[0] ? (
                                <img 
                                    src={item.product.images[0]} 
                                    alt={item.title} 
                                    style={styles.productImage} 
                                />
                            ) : (
                                <div style={styles.itemImageFallback}>
                                    {item.title.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div style={styles.itemDetails}>
                          <Link
                            to={`/product/${item.product?._id || item.product}`}
                            className="item-link"
                            style={styles.itemTitle}
                          >
                            {item.title}
                          </Link>
                          <div style={styles.itemMeta}>
                            <span style={styles.metaTag}>Qty: {item.quantity}</span>
                            <span style={styles.metaPrice}>₹{item.price?.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Action for individual item */}
                        <div style={styles.itemAction}>
                            {order.orderStatus === "delivered" && (
                                <Link
                                to={`/product/${item.product?._id || item.product}/write-review`}
                                className="action-btn-outline"
                                >
                                Rate & Review
                                </Link>
                            )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 110px)",
    padding: "40px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  layout: { maxWidth: "900px", margin: "0 auto" },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "32px",
    letterSpacing: "-0.5px",
  },
  center: { padding: "100px", textAlign: "center", color: "#64748b", fontSize: "1.1rem" },
  emptyState: {
    backgroundColor: "#fff",
    padding: "80px 20px",
    textAlign: "center",
    borderRadius: "16px",
    border: "1px dashed #cbd5e1",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: "16px" },
  shopBtn: {
    display: "inline-block",
    backgroundColor: "#0f172a",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 28px",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "background 0.2s",
  },
  orderList: { display: "flex", flexDirection: "column", gap: "28px" },
  orderHeader: {
    backgroundColor: "#f8fafc",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  headerGrid: { 
    display: "flex", 
    justifyContent: "space-between", 
    flexWrap: "wrap", 
    gap: "24px" 
  },
  label: {
    fontSize: "0.7rem",
    color: "#64748b",
    fontWeight: "700",
    marginBottom: "6px",
    display: "block",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "0.95rem",
    color: "#0f172a",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px dashed #e2e8f0"
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "50px",
    fontSize: "0.8rem",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid",
    letterSpacing: "0.5px"
  },
  orderBody: { padding: "24px" },
  itemRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  imageWrapper: {
    width: "80px",
    height: "80px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "4px"
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  itemImageFallback: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#94a3b8",
  },
  itemDetails: { flex: 1, minWidth: "200px" },
  itemTitle: {
    fontSize: "1.05rem",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
    lineHeight: "1.4",
  },
  itemMeta: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px",
    fontSize: "0.9rem" 
  },
  metaTag: {
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "500"
  },
  metaPrice: {
    fontWeight: "700",
    color: "#0f172a"
  },
  itemAction: {
    display: "flex",
    alignItems: "center",
  }
};