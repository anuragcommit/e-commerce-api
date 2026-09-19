// src/pages/MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get("/orders/my-orders");
            // Backend ApiResponse standard structure: res.data.data
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
            alert("Order cancelled and stock restored successfully!");
            fetchOrders(); // Refresh list to see updated status
        } catch (err) {
            alert(err.response?.data?.message || "Error cancelling order");
        }
    };

    if (loading) return <p style={{ padding: "20px" }}>Loading your orders...</p>;
    if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 16px" }}>
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>You have not placed any orders yet.</p>
            ) : (
                orders.map((order) => (
                    <div key={order._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4>Order ID: {order._id}</h4>
                            <span style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                background: order.orderStatus === "cancelled" ? "#fed7d7" : order.orderStatus === "delivered" ? "#c6f6d5" : "#feebc8",
                                color: order.orderStatus === "cancelled" ? "#9b2c2c" : order.orderStatus === "delivered" ? "#22543d" : "#744210",
                                fontWeight: "bold"
                            }}>
                                {order.orderStatus.toUpperCase()}
                            </span>
                        </div>
                        <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                        
                        <div>
                            <h5>Items:</h5>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        {item.title} — Qty: {item.quantity} × ₹{item.price}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {order.orderStatus === "processing" && (
                            <button
                                onClick={() => handleCancelOrder(order._id)}
                                style={{ background: "#e53e3e", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}