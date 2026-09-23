import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/addresses");
      setAddresses(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) =>
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  // Open form in "Add" mode
  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditId(null);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
    setShowForm(true);
  };

  // Open form in "Edit" mode and populate data
  const handleEditClick = (addr) => {
    setIsEditing(true);
    setEditId(addr._id);
    setNewAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || "India",
    });
    setShowForm(true);
  };

  // Reset form safely
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
  };

  // Handles both Create (POST) and Update (PATCH)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.patch(`/users/addresses/${editId}`, newAddress);
        toast.success("Address updated successfully!");
      } else {
        await API.post("/users/addresses", newAddress);
        toast.success("New address saved!");
      }
      handleCancel(); // Close and reset form
      fetchAddresses(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  // Handles Delete (DELETE)
  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await API.delete(`/users/addresses/${addressId}`);
      toast.success("Address deleted successfully!");
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete address");
    }
  };

  if (loading) return <div style={styles.center}>Loading addresses...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.layout}>
        <div style={styles.headerRow}>
          <h1 style={styles.pageTitle}>Saved Addresses</h1>
          {!showForm && (
            <button onClick={handleAddNewClick} style={styles.addBtn}>
              + Add New
            </button>
          )}
        </div>

        {showForm ? (
          <div style={styles.formCard}>
            <h3
              style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}
            >
              {isEditing ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Street / House No.</label>
                <input
                  required
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
                    name="country"
                    value={newAddress.country}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.actionRow}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {isEditing ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={styles.grid}>
            {addresses.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                  You haven't saved any addresses yet.
                </p>
                <button
                  onClick={handleAddNewClick}
                  style={{ ...styles.addBtn, marginTop: "12px" }}
                >
                  Add your first address
                </button>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} style={styles.card}>
                  <div>
                    <div style={styles.tag}>
                      {addr.isDefault ? "Default" : "Home"}
                    </div>
                    <p style={styles.text}>
                      <strong>{addr.street}</strong>
                    </p>
                    <p style={styles.text}>
                      {addr.city}, {addr.state}
                    </p>
                    <p style={styles.text}>
                      {addr.postalCode}, {addr.country}
                    </p>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleEditClick(addr)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
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
    fontFamily: "'Inter', sans-serif",
  },
  layout: { maxWidth: "900px", margin: "0 auto" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  addBtn: {
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  center: { padding: "100px", textAlign: "center", color: "#64748b" },
  emptyState: {
    gridColumn: "1 / -1",
    backgroundColor: "#fff",
    padding: "60px",
    textAlign: "center",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tag: {
    display: "inline-block",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "50px",
    marginBottom: "12px",
  },
  text: {
    margin: "0 0 6px 0",
    fontSize: "0.95rem",
    color: "#334155",
    lineHeight: "1.5",
  },
  cardActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px dashed #e2e8f0",
  },
  editBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
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
    color: "#0f172a",
  },
  actionRow: {
    display: "flex",
    gap: "16px",
    marginTop: "16px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#475569",
  },
  saveBtn: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
