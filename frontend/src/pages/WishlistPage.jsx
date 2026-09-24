import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/wishlist");
      setWishlist(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    // Optimistic UI update for instant feedback
    const updatedWishlist = wishlist.filter((item) => item._id !== productId);
    setWishlist(updatedWishlist);
    toast.success("Removed from wishlist");

    try {
      await API.post(`/users/wishlist/${productId}`);
    } catch (err) {
      toast.error("Failed to remove item");
      fetchWishlist(); // Revert on failure
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 1500);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Loading your wishlist...
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <style>{`
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
        }
        .product-card {
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .product-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .product-link {
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            flex: 1;
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          My Wishlist{" "}
          <span
            style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: "500" }}
          >
            ({wishlist.length})
          </span>
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>❤️</div>
          <h3
            style={{
              margin: "0 0 8px 0",
              color: "#0f172a",
              fontSize: "1.5rem",
            }}
          >
            Your wishlist is empty
          </h3>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Save items you love here to buy them later.
          </p>
          <Link to="/" style={styles.shopBtn}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((item) => {
            const discount =
              item.originalPrice > item.price
                ? Math.round(
                    ((item.originalPrice - item.price) / item.originalPrice) *
                      100,
                  )
                : 0;

            return (
              <div key={item._id} className="product-card" style={styles.card}>
                {/* Delete Button (Top Right) */}
                <button
                  onClick={() => handleRemove(item._id)}
                  style={styles.deleteBtn}
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                <Link to={`/product/${item._id}`} className="product-link">
                  <div style={styles.imageBox}>
                    <img
                      src={item.images?.[0] || "https://placehold.co/300x300"}
                      alt={item.title}
                      style={styles.image}
                    />
                    {discount > 0 && (
                      <span style={styles.discountBadge}>{discount}% off</span>
                    )}
                  </div>

                  <div style={styles.info}>
                    <span style={styles.brand}>{item.brand}</span>
                    <h3 style={styles.productTitle}>{item.title}</h3>

                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>
                        ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                      {item.originalPrice > item.price && (
                        <span style={styles.originalPrice}>
                          ₹{item.originalPrice?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  style={{
                    ...styles.addToCartBtn,
                    backgroundColor:
                      addedId === item._id ? "#10b981" : "#fb641b",
                  }}
                >
                  {addedId === item._id ? "✓ Added" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "32px 20px",
    minHeight: "calc(100vh - 110px)",
    backgroundColor: "#f1f3f6",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  card: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  deleteBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    fontWeight: "bold",
  },
  imageBox: {
    position: "relative",
    width: "100%",
    height: "190px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    borderRadius: "4px",
  },
  image: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  discountBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "#388e3c",
    color: "#ffffff",
    fontSize: "0.72rem",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "3px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    marginTop: "12px",
    marginBottom: "16px",
  },
  brand: {
    fontSize: "0.72rem",
    color: "#878787",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: "4px",
  },
  productTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.4",
  },
  priceRow: { display: "flex", alignItems: "baseline", gap: "8px" },
  currentPrice: { fontSize: "1.1rem", fontWeight: "700", color: "#212121" },
  originalPrice: {
    fontSize: "0.85rem",
    color: "#878787",
    textDecoration: "line-through",
  },
  addToCartBtn: {
    width: "100%",
    padding: "10px 0",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  emptyState: {
    backgroundColor: "#fff",
    padding: "80px 20px",
    textAlign: "center",
    borderRadius: "8px",
    border: "1px dashed #cbd5e1",
    marginTop: "40px",
  },
  shopBtn: {
    display: "inline-block",
    backgroundColor: "#064e3b",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
  },
};
