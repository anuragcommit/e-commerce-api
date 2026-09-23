// src/pages/CartPage.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartCount, addToCart, decrementQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();  

  const handleMoveToWishlist = async (item) => {
    try {
      const productId = item.product?._id || item._id;
      await API.post("/wishlist", { productId });
      removeFromCart(productId);

      toast.success("Moved to your wishlist!", {
        style: { fontWeight: 600, color: "#0f172a" },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move to wishlist");
    }
  };

  // Safely calculate billing details by checking for the nested product object
  const totalOriginalPrice = cartItems.reduce((acc, item) => {
    const product = item.product || item;
    const price =
      product.originalPrice || product.price || item.priceAtAddition || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const totalSellingPrice = cartItems.reduce((acc, item) => {
    const product = item.product || item;
    const price = product.price || item.priceAtAddition || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const totalDiscount = totalOriginalPrice - totalSellingPrice;
  const deliveryCharge =
    totalSellingPrice > 500 || totalSellingPrice === 0 ? 0 : 40;
  const finalAmount = totalSellingPrice + deliveryCharge;

  if (cartCount === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg width="130" height="130" viewBox="0 0 200 200" fill="none">
              <ellipse cx="100" cy="165" rx="75" ry="8" fill="#e2e8f0" />
              <path
                d="M45 55h15l18 65h72l14-50H68"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="85"
                cy="142"
                r="10"
                stroke="#94a3b8"
                strokeWidth="5"
                fill="#ffffff"
              />
              <circle
                cx="145"
                cy="142"
                r="10"
                stroke="#94a3b8"
                strokeWidth="5"
                fill="#ffffff"
              />
              <rect
                x="95"
                y="70"
                width="30"
                height="26"
                rx="3"
                fill="#34d399"
              />
              <line
                x1="95"
                y1="83"
                x2="125"
                y2="83"
                stroke="#064e3b"
                strokeWidth="2"
              />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px 0",
            }}
          >
            {isAuthenticated ? "Your cart is empty!" : "Missing Cart items?"}
          </h2>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#64748b",
              margin: "0 0 24px 0",
            }}
          >
            {isAuthenticated
              ? "Explore our product catalog and find items to add."
              : "Sign in to see items you added previously."}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {!isAuthenticated && (
              <Link to="/login" style={styles.primaryBtn}>
                Sign in to your account
              </Link>
            )}
            <Link
              to="/"
              style={!isAuthenticated ? styles.secondaryBtn : styles.primaryBtn}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.cartViewport}>
      <div style={styles.cartLayout}>
        <div style={styles.itemsColumn}>
          <div style={styles.sectionHeader}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              My Cart ({cartCount})
            </h2>
          </div>

          {cartItems.map((item, index) => {
            // Extract product data cleanly
            const product = item.product || item;
            const productId = product._id;
            const qty = item.quantity || 1;
            const isMinusDisabled = qty <= 1;

            // Fallbacks for missing data
            const title = product.title || "Product Unavailable";
            const brand = product.brand || "GENERIC";
            const price = product.price || item.priceAtAddition || 0;
            const originalPrice = product.originalPrice || price;
            const image =
              product.images?.[0] ||
              "https://placehold.co/150x150?text=Product";

            const itemDiscount =
              originalPrice > price
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;

            // Guaranteed unique key for React
            const uniqueKey = item._id || productId || `cart-item-${index}`;

            return (
              <div key={uniqueKey} style={styles.cartItemCard}>
                <div style={styles.itemMain}>
                  <div style={styles.itemImageContainer}>
                    <img src={image} alt={title} style={styles.itemImage} />
                  </div>

                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemTitle}>{title}</h3>
                    <span style={styles.itemBrand}>{brand}</span>

                    <div style={styles.priceRow}>
                      <span style={styles.itemPrice}>
                        ₹{(price * qty).toLocaleString("en-IN")}
                      </span>
                      {originalPrice > price && (
                        <>
                          <span style={styles.itemOriginalPrice}>
                            ₹{(originalPrice * qty).toLocaleString("en-IN")}
                          </span>
                          <span style={styles.itemDiscountBadge}>
                            {itemDiscount}% Off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.itemControls}>
                  <div style={styles.quantityBox}>
                    <button
                      type="button"
                      disabled={isMinusDisabled}
                      onClick={() => decrementQuantity(productId)}
                      style={{
                        ...styles.qtyBtn,
                        opacity: isMinusDisabled ? 0.35 : 1,
                        cursor: isMinusDisabled ? "not-allowed" : "pointer",
                        backgroundColor: isMinusDisabled
                          ? "#f1f5f9"
                          : "#ffffff",
                        borderColor: isMinusDisabled ? "#e2e8f0" : "#cbd5e1",
                      }}
                    >
                      −
                    </button>

                    <span style={styles.qtyCount}>{qty}</span>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(item)}
                      style={styles.wishlistBtn}
                    >
                      MOVE TO WISHLIST
                    </button>

                    <button
                      type="button"
                      title="Remove Item"
                      onClick={() => removeFromCart(productId)}
                      style={styles.deleteIconBtn}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={styles.placeOrderBar}>
            <Link to="/" style={styles.continueShoppingLink}>
              ← Add More Products
            </Link>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              style={styles.placeOrderBtn}
            >
              PLACE ORDER
            </button>
          </div>
        </div>

        <div style={styles.priceSummaryColumn}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>PRICE DETAILS</h3>
            <div style={styles.divider} />

            <div style={styles.summaryRow}>
              <span>
                Price ({cartCount} {cartCount === 1 ? "item" : "items"})
              </span>
              <span>₹{totalOriginalPrice.toLocaleString("en-IN")}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Discount</span>
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                − ₹{totalDiscount.toLocaleString("en-IN")}
              </span>
            </div>

            <div style={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span>
                {deliveryCharge === 0 ? (
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    FREE
                  </span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>

            <div style={styles.dividerDashed} />

            <div style={styles.totalRow}>
              <span>Total Amount</span>
              <span>₹{finalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div style={styles.dividerDashed} />

            {totalDiscount > 0 && (
              <p style={styles.savingsText}>
                You will save ₹{totalDiscount.toLocaleString("en-IN")} on this
                order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cartViewport: {
    width: "100%",
    minHeight: "calc(100vh - 110px)",
    backgroundColor: "#f1f3f6",
    padding: "20px",
    boxSizing: "border-box",
  },
  cartLayout: {
    maxWidth: "1150px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    alignItems: "flex-start",
  },
  itemsColumn: {
    flex: "1 1 650px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionHeader: {
    backgroundColor: "#ffffff",
    padding: "14px 20px",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
  },
  cartItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
  },
  itemMain: { display: "flex", gap: "18px" },
  itemImageContainer: {
    width: "90px",
    height: "90px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: "4px",
    padding: "6px",
  },
  itemImage: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
  itemDetails: { flex: 1 },
  itemTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  itemBrand: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginTop: "10px",
  },
  itemPrice: { fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" },
  itemOriginalPrice: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    textDecoration: "line-through",
  },
  itemDiscountBadge: { fontSize: "0.78rem", color: "#10b981", fontWeight: 700 },
  itemControls: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    flexWrap: "wrap",
  },
  quantityBox: { display: "flex", alignItems: "center", gap: "8px" },
  qtyBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
    lineHeight: 1,
  },
  qtyCount: {
    width: "36px",
    textAlign: "center",
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  wishlistBtn: {
    background: "none",
    border: "none",
    color: "#0f172a",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: 0,
  },
  deleteIconBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  placeOrderBar: {
    backgroundColor: "#ffffff",
    padding: "16px 20px",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
  },
  continueShoppingLink: {
    color: "#064e3b",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: "0.88rem",
  },
  placeOrderBtn: {
    backgroundColor: "#fb641b",
    color: "#ffffff",
    padding: "12px 36px",
    border: "none",
    borderRadius: "4px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(251, 100, 27, 0.3)",
  },
  priceSummaryColumn: { flex: "1 1 320px" },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
  },
  summaryTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#878787",
    margin: "0 0 12px 0",
    letterSpacing: "0.03em",
  },
  divider: { height: "1px", backgroundColor: "#f1f5f9", marginBottom: "14px" },
  dividerDashed: { borderBottom: "1px dashed #e2e8f0", margin: "14px 0" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.88rem",
    color: "#334155",
    marginBottom: "12px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  savingsText: {
    margin: "8px 0 0 0",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#10b981",
  },
  emptyContainer: {
    width: "100%",
    minHeight: "75vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: "20px",
  },
  emptyCard: {
    width: "100%",
    maxWidth: "540px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "40px 24px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  primaryBtn: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "10px 24px",
    borderRadius: "4px",
    fontWeight: 700,
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  secondaryBtn: {
    color: "#065f46",
    fontWeight: 600,
    fontSize: "0.88rem",
    textDecoration: "none",
  },
};
