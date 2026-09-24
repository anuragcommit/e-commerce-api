// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);

  // Smart Search States
  const [didYouMean, setDidYouMean] = useState(null);
  const [isGibberish, setIsGibberish] = useState(false);

  // Wishlist States
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [animatingId, setAnimatingId] = useState(null); // Tracks the bubble animation

  // Fetch Wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/users/wishlist");

        const idsOnly = res.data.data.map((item) => item._id || item);
        setWishlistIds(new Set(idsOnly));
      } catch (err) {
        // Silently fail if user is not logged in (guests can still browse)
      }
    };
    fetchWishlist();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError("");
      try {
        const query = location.search || "";
        const res = await API.get(`/products${query}`);

        const data = res.data?.data;
        const items = Array.isArray(data) ? data : data?.products || [];

        setProducts(items);
        setDidYouMean(data?.didYouMean || null);
        setIsGibberish(data?.isGibberishFallback || false);
      } catch (err) {
        setError("Failed to load products. Please check server connectivity.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [location.search]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);

      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 1500);

      toast.custom(
        (t) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              gap: "14px",
              animation: t.visible
                ? "custom-enter 0.3s ease"
                : "custom-leave 0.3s ease",
            }}
          >
            <img
              src={product.images?.[0] || "https://placehold.co/50"}
              alt={product.title}
              style={{
                width: "45px",
                height: "45px",
                objectFit: "contain",
                borderRadius: "4px",
                backgroundColor: "#f8fafc",
                padding: "2px",
              }}
            />
            <div>
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#0f172a",
                }}
              >
                {product.title.length > 30
                  ? product.title.substring(0, 30) + "..."
                  : product.title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                ✓ Added to cart
              </p>
            </div>
          </div>
        ),
        { duration: 200 },
      );
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  // Toggle Wishlist Logic with Database syncing
  const handleToggleWishlist = async (product) => {
    const isWished = wishlistIds.has(product._id);
    const shortTitle =
      product.title.length > 20
        ? product.title.substring(0, 20) + "..."
        : product.title;

    // Trigger the bubble animation
    setAnimatingId(product._id);
    setTimeout(() => setAnimatingId(null), 300); // Remove animation class after 300ms

    // Update local UI state instantly for a snappy feel
    setWishlistIds((prev) => {
      const newSet = new Set(prev);
      if (isWished) newSet.delete(product._id);
      else newSet.add(product._id);
      return newSet;
    });

    // Fire the beautiful toast
    toast.success(
      isWished
        ? `Removed ${shortTitle} from wishlist`
        : `❤️ Added ${shortTitle} to wishlist`,
        { duration: 1000 }
    );

    try {
      // Sync the change with MongoDB
      await API.post(`/users/wishlist/${product._id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please log in to save items to your wishlist!");
        // Revert UI change if not logged in
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          isWished ? newSet.add(product._id) : newSet.delete(product._id);
          return newSet;
        });
      }
    }
  };

  return (
    <main style={styles.container}>
      <style>{`
        /* The Bubble Animation Keyframes */
        @keyframes heartPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); }
        }
        .animating-heart {
            animation: heartPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

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
        .wishlist-btn {
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.1s ease;
        }
        .wishlist-btn:hover {
            transform: scale(1.1);
        }
        @media (max-width: 540px) {
            .product-grid {
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .card-padding {
                padding: 10px !important;
            }
            .card-image-box {
                height: 140px !important;
            }
            .card-title {
                font-size: 0.8rem !important;
            }
        }
      `}</style>

      {didYouMean && (
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e3a8a",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "1.05rem",
          }}
        >
          Did you mean to search for:{" "}
          <strong
            style={{
              cursor: "pointer",
              color: "#2563eb",
              textDecoration: "underline",
            }}
            onClick={() => navigate(`/?search=${didYouMean}`)}
          >
            {didYouMean}
          </strong>
          ?
        </div>
      )}

      {isGibberish && (
        <div
          style={{
            backgroundColor: "#fdf4ff",
            border: "1px solid #f5d0fe",
            color: "#701a75",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "1.05rem",
          }}
        >
          🤷 We couldn't find an exact match, but hey, here are some snacks to
          cheer you up! 🍫
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={styles.skeletonCard} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>🔍</p>
          <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>
            No products found
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
            Try checking your spelling or adjusting your category filter.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((item) => {
            const discount =
              item.originalPrice > item.price
                ? Math.round(
                    ((item.originalPrice - item.price) / item.originalPrice) *
                      100,
                  )
                : 0;
            const isWished = wishlistIds.has(item._id);
            const isAnimating = animatingId === item._id;

            return (
              <div
                key={item._id}
                className="product-card card-padding"
                style={styles.card}
              >
                <Link to={`/product/${item._id}`} className="product-link">
                  <div className="card-image-box" style={styles.imageBox}>
                    <img
                      src={item.images?.[0] || "https://placehold.co/300x300"}
                      alt={item.title}
                      style={styles.image}
                      loading="lazy"
                    />
                    {discount > 0 && (
                      <span style={styles.discountBadge}>{discount}% off</span>
                    )}
                  </div>

                  <div style={styles.info}>
                    <span style={styles.brand}>{item.brand}</span>
                    <h3
                      className="card-title"
                      style={styles.title}
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    <div style={styles.ratingRow}>
                      <span style={styles.ratingBadge}>
                        {item.rating || 4.2} ★
                      </span>
                      <span style={styles.reviewsCount}>
                        ({(item.numReviews || 0).toLocaleString()})
                      </span>
                    </div>

                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.originalPrice > item.price && (
                        <span style={styles.originalPrice}>
                          ₹{item.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div style={styles.actionRow}>
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

                  <button
                    type="button"
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleWishlist(item);
                    }}
                    title={
                      isWished ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={isWished ? "#ef4444" : "none"} // Filled Red when active, empty when not
                      stroke={isWished ? "#ef4444" : "#475569"} // Red outline when active, gray when not
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={isAnimating ? "animating-heart" : ""}
                      style={{ transition: "fill 0.2s ease, stroke 0.2s ease" }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
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
    padding: "24px 20px",
    boxSizing: "border-box",
    minHeight: "calc(100vh - 110px)",
    backgroundColor: "#f1f3f6",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
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
  info: { display: "flex", flexDirection: "column", marginTop: "10px" },
  brand: {
    fontSize: "0.72rem",
    color: "#878787",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: "2px",
  },
  title: {
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 6px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.3",
    height: "2.6em",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  ratingBadge: {
    backgroundColor: "#388e3c",
    color: "#ffffff",
    fontSize: "0.72rem",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "3px",
  },
  reviewsCount: { fontSize: "0.75rem", color: "#878787" },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "12px",
  },
  currentPrice: { fontSize: "1.05rem", fontWeight: "700", color: "#212121" },
  originalPrice: {
    fontSize: "0.82rem",
    color: "#878787",
    textDecoration: "line-through",
  },

  // Action Row Styles
  actionRow: {
    display: "flex",
    gap: "12px",
    marginTop: "auto",
    alignItems: "center",
  },
  addToCartBtn: {
    flex: 1,
    padding: "9px 0",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  skeletonCard: {
    height: "320px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite",
  },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "0.88rem",
  },
};
