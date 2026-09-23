import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, fetchCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await API.get("/users/addresses");
        const addresses = res.data.data || [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedAddress(addresses[0]);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  const totalSellingPrice = cartItems.reduce((acc, item) => {
    const product = item.product || item;
    return acc + (product.price || 0) * (item.quantity || 1);
  }, 0);
  const deliveryCharge =
    totalSellingPrice > 500 || totalSellingPrice === 0 ? 0 : 40;
  const finalAmount = totalSellingPrice + deliveryCharge;

  const handleChange = (e) =>
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!showNewAddressForm && !selectedAddress) {
      return toast.error("Please select a delivery address.");
    }

    setIsSubmitting(true);
    try {
      let finalShippingAddress = selectedAddress;

      // If using a new address, save it to the user's profile first
      if (showNewAddressForm) {
        await API.post("/users/addresses", newAddress);
        finalShippingAddress = newAddress;
      }

      // Place the order
      await API.post("/orders", { shippingAddress: finalShippingAddress });

      toast.success("Order placed successfully! 🎉");
      await fetchCart();
      navigate("/my-orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
      setIsSubmitting(false);
    }
  };

  if (cartCount === 0)
    return (
      <div style={styles.emptyState}>
        <h2>Your cart is empty.</h2>
      </div>
    );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.layout}>
        <div style={styles.formSection}>
          <h2 style={styles.heading}>Select Delivery Address</h2>

          {/* Saved Addresses Grid */}
          {!showNewAddressForm && savedAddresses.length > 0 && (
            <div style={styles.addressGrid}>
              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedAddress(addr)}
                  style={{
                    ...styles.addressCard,
                    borderColor:
                      selectedAddress === addr ? "#2563eb" : "#e2e8f0",
                    backgroundColor:
                      selectedAddress === addr ? "#eff6ff" : "#ffffff",
                  }}
                >
                  {selectedAddress === addr && (
                    <div style={styles.checkIcon}>✓</div>
                  )}
                  <p style={styles.addrText}>
                    <strong>{addr.street}</strong>
                  </p>
                  <p style={styles.addrText}>
                    {addr.city}, {addr.state}
                  </p>
                  <p style={styles.addrText}>
                    {addr.postalCode}, {addr.country}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowNewAddressForm(true)}
                style={styles.addNewBtn}
              >
                + Add New Address
              </button>
            </div>
          )}

          {/* New Address Form */}
          {showNewAddressForm && (
            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              style={styles.form}
            >
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  style={styles.backBtn}
                >
                  ← Back to Saved Addresses
                </button>
              )}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Street / House No.</label>
                <input
                  required
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>City</label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>State</label>
                  <input
                    required
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Postal Code</label>
                  <input
                    required
                    type="text"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Country</label>
                  <input
                    required
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </form>
          )}

          <h3 style={{ ...styles.heading, marginTop: "32px" }}>
            Payment Method
          </h3>
          <div style={styles.paymentBox}>
            <input
              type="radio"
              checked
              readOnly
              style={{ accentColor: "#fb641b" }}
            />
            <span style={{ fontWeight: 600, color: "#282c3f" }}>
              Cash on Delivery (COD)
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            style={styles.submitBtn}
          >
            {isSubmitting
              ? "PROCESSING..."
              : `CONFIRM ORDER (₹${finalAmount.toLocaleString("en-IN")})`}
          </button>
        </div>

        <div style={styles.summarySection}>
          <h2 style={styles.heading}>Order Summary</h2>
          <div style={styles.summaryCard}>
            {cartItems.map((item, idx) => {
              const product = item.product || item;
              return (
                <div key={idx} style={styles.summaryItem}>
                  <span style={styles.itemTitle}>
                    {item.quantity} x {product.title?.substring(0, 30)}...
                  </span>
                  <span style={styles.itemPrice}>
                    ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
            <div style={styles.divider} />
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{totalSellingPrice.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span>Total</span>
              <span>₹{finalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 110px)",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
  },
  layout: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    alignItems: "flex-start",
  },
  formSection: {
    flex: "1 1 600px",
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  summarySection: { flex: "1 1 300px" },
  heading: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  addressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  addressCard: {
    position: "relative",
    padding: "16px",
    borderRadius: "8px",
    border: "2px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  checkIcon: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: "bold",
  },
  addrText: {
    margin: "0 0 4px 0",
    fontSize: "0.9rem",
    color: "#334155",
    lineHeight: "1.4",
  },
  addNewBtn: {
    padding: "16px",
    border: "2px dashed #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "16px",
    padding: 0,
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", color: "#475569", fontWeight: "600" },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  paymentBox: {
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f8fafc",
  },
  submitBtn: {
    width: "100%",
    marginTop: "32px",
    padding: "16px",
    backgroundColor: "#fb641b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(251, 100, 27, 0.2)",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "0.9rem",
    color: "#475569",
  },
  itemTitle: { flex: 1, paddingRight: "16px" },
  itemPrice: { fontWeight: "600", color: "#0f172a" },
  divider: { height: "1px", backgroundColor: "#e2e8f0", margin: "16px 0" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "0.95rem",
    color: "#334155",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyState: { padding: "100px", textAlign: "center", color: "#64748b" },
};
