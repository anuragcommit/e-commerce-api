// src/pages/ProductDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useCart } from "../context/CartContext";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodRes = await API.get(`/products/${productId}`);
        const fetchedProduct = prodRes.data.data;
        setProduct(fetchedProduct);

        const reviewRes = await API.get(`/reviews/product/${productId}`);
        setReviews(reviewRes.data.data || []);

        // Safely get category ID or string to fetch similar products
        const categoryVal =
          fetchedProduct.category?._id || fetchedProduct.category;

        if (categoryVal) {
          const similarRes = await API.get(`/products?category=${categoryVal}`);
          const allCatProducts = Array.isArray(similarRes.data?.data)
            ? similarRes.data.data
            : similarRes.data?.data?.products || [];
          setSimilarProducts(
            allCatProducts.filter((p) => p._id !== productId).slice(0, 5),
          );
        }
      } catch (err) {
        console.error("Failed to load product details", err);
      }
    };
    window.scrollTo(0, 0);
    loadData();
  }, [productId]);

  const fireToast = (prod) => {
    toast.custom(
      (t) => (
        <div style={styles.toastCard}>
          <img
            src={prod.images?.[0] || "https://placehold.co/50"}
            alt={prod.title}
            style={styles.toastImg}
          />
          <div>
            <p style={styles.toastTitle}>{prod.title.substring(0, 30)}...</p>
            <p style={styles.toastSuccess}>✓ Added to cart</p>
          </div>
        </div>
      ),
      { duration: 2000 },
    );
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
      fireToast(product);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product);
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to process Buy Now");
    }
  };

  if (!product) return <div style={styles.loader}>Loading...</div>;

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  // 👉 FIX: Safely extract names if your backend populates these fields as objects
  const categoryName =
    product.category?.name ||
    (typeof product.category === "string" ? product.category : "Products");
  const brandName =
    product.brand?.name ||
    (typeof product.brand === "string" ? product.brand : "GENERIC");

  return (
    <div style={styles.pageContainer}>
      <style>{`
                .split-layout {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 48px;
                    align-items: flex-start;
                }
                .image-section {
                    flex: 1 1 400px;
                    width: 100%;
                }
                @media (min-width: 900px) {
                    .image-section {
                        position: sticky;
                        top: 100px;
                    }
                }
                .similar-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }
                .similar-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .similar-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
                }
            `}</style>

      <div style={styles.breadcrumbs}>
        <Link to="/" style={styles.breadcrumbLink}>
          Home
        </Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbLink}>{categoryName}</span>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{brandName}</span>
      </div>

      <div className="split-layout">
        <div className="image-section">
          <div style={styles.mainImageBox}>
            <img
              src={product.images?.[0] || "https://placehold.co/600x800"}
              alt={product.title}
              style={styles.mainImage}
            />
          </div>
        </div>

        <div style={styles.infoSection}>
          <h1 style={styles.brand}>{brandName}</h1>
          <h2 style={styles.title}>{product.title}</h2>

          <div style={styles.ratingCapsule}>
            <span style={styles.ratingStars}>
              {product.averageRating || 4.2} ★
            </span>
            <span style={styles.ratingCount}>| {reviews.length} Ratings</span>
          </div>

          <div style={styles.divider} />

          <div style={styles.priceContainer}>
            <span style={styles.currentPrice}>
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span style={styles.mrp}>
                  MRP{" "}
                  <span style={styles.strikethrough}>
                    ₹{product.originalPrice?.toLocaleString("en-IN")}
                  </span>
                </span>
                <span style={styles.discountBadge}>({discount}% OFF)</span>
              </>
            )}
          </div>
          <p style={styles.taxText}>inclusive of all taxes</p>

          <div style={styles.actionButtons}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1 || isAdded}
              style={{
                ...styles.addToBagBtn,
                opacity: product.stock < 1 ? 0.5 : 1,
              }}
            >
              <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>🛍️</span>
              {isAdded
                ? "ADDED TO BAG"
                : product.stock < 1
                  ? "OUT OF STOCK"
                  : "ADD TO CART"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock < 1}
              style={{
                ...styles.buyNowBtn,
                opacity: product.stock < 1 ? 0.5 : 1,
              }}
            >
              BUY NOW ➔
            </button>
          </div>

          <div style={styles.servicePromises}>
            <div style={styles.promiseItem}>
              <span style={styles.promiseIcon}>🛡️</span>
              <span style={styles.promiseText}>100% Original</span>
            </div>
            <div style={styles.promiseItem}>
              <span style={styles.promiseIcon}>🔄</span>
              <span style={styles.promiseText}>14 Day Returns</span>
            </div>
            <div style={styles.promiseItem}>
              <span style={styles.promiseIcon}>🚚</span>
              <span style={styles.promiseText}>Free Delivery</span>
            </div>
          </div>

          <div style={styles.divider} />

          <h3 style={styles.sectionHeading}>PRODUCT DETAILS</h3>
          <p style={styles.description}>{product.description}</p>

          <div style={styles.divider} />

          <div style={styles.reviewsHeader}>
            <h3 style={styles.sectionHeading}>CUSTOMER REVIEWS</h3>
            <button
              onClick={() => navigate(`/product/${productId}/write-review`)}
              style={styles.writeReviewBtn}
            >
              Write a Review
            </button>
          </div>

          <div style={styles.reviewsList}>
            {reviews.length === 0 ? (
              <p style={styles.noReviews}>
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((rev) => {
                // Safe extraction for review author names
                const reviewerName =
                  rev.user?.name ||
                  rev.user?.username ||
                  (typeof rev.user === "string" ? rev.user : "Verified Buyer");
                return (
                  <div key={rev._id} style={styles.reviewCard}>
                    <div style={styles.reviewCardHeader}>
                      <div style={styles.reviewStars}>
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>
                      <span style={styles.reviewAuthor}>{reviewerName}</span>
                    </div>
                    <p style={styles.reviewText}>{rev.comment}</p>
                    {rev.image && (
                      <img
                        src={rev.image}
                        alt="Review"
                        style={styles.reviewImage}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div style={styles.similarSection}>
          <h3 style={styles.similarHeading}>SIMILAR PRODUCTS</h3>
          <div className="similar-grid">
            {similarProducts.map((simProd) => {
              // Safe extraction for similar product brands
              const simBrandName =
                simProd.brand?.name ||
                (typeof simProd.brand === "string" ? simProd.brand : "GENERIC");
              return (
                <Link
                  to={`/product/${simProd._id}`}
                  key={simProd._id}
                  className="similar-card"
                  style={styles.similarProductCard}
                >
                  <div style={styles.simImageWrap}>
                    <img
                      src={simProd.images?.[0] || "https://placehold.co/200"}
                      alt={simProd.title}
                      style={styles.simImage}
                    />
                  </div>
                  <div style={styles.simInfo}>
                    <p style={styles.simBrand}>{simBrandName}</p>
                    <p style={styles.simTitle}>{simProd.title}</p>
                    <p style={styles.simPrice}>
                      ₹{simProd.price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 20px 60px 20px",
  },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.85rem",
    marginBottom: "24px",
    color: "#282c3f",
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    textDecoration: "none",
    color: "#535665",
    textTransform: "capitalize",
  },
  breadcrumbSeparator: { margin: "0 8px", color: "#d4d5d9" },
  breadcrumbCurrent: { fontWeight: "700", textTransform: "capitalize" },
  mainImageBox: {
    width: "100%",
    backgroundColor: "#f5f5f6",
    borderRadius: "4px",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    maxHeight: "600px",
  },
  infoSection: { flex: "1 1 500px", display: "flex", flexDirection: "column" },
  brand: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#282c3f",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "400",
    color: "#535665",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
  },
  ratingCapsule: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #eaeaec",
    padding: "4px 12px",
    borderRadius: "2px",
    alignSelf: "flex-start",
  },
  ratingStars: {
    fontWeight: "700",
    color: "#282c3f",
    fontSize: "0.9rem",
    marginRight: "8px",
  },
  ratingCount: { color: "#535665", fontSize: "0.9rem" },
  divider: { height: "1px", backgroundColor: "#eaeaec", margin: "24px 0" },
  priceContainer: { display: "flex", alignItems: "baseline", gap: "12px" },
  currentPrice: { fontSize: "1.8rem", fontWeight: "700", color: "#282c3f" },
  mrp: { fontSize: "1.1rem", color: "#7e818c" },
  strikethrough: { textDecoration: "line-through" },
  discountBadge: { fontSize: "1.1rem", fontWeight: "700", color: "#ff905a" },
  taxText: {
    fontSize: "0.85rem",
    color: "#03a685",
    fontWeight: "700",
    margin: "6px 0 24px 0",
  },
  actionButtons: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  addToBagBtn: {
    flex: 1,
    minWidth: "220px",
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1 px solid #000000",
    padding: "16px",
    borderRadius: "4px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowBtn: {
    flex: 1,
    minWidth: "220px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "16px",
    borderRadius: "4px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
  },
  servicePromises: {
    display: "flex",
    gap: "24px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
  promiseItem: { display: "flex", alignItems: "center", gap: "8px" },
  promiseIcon: { fontSize: "1.4rem" },
  promiseText: { fontSize: "0.85rem", color: "#535665", fontWeight: "500" },
  sectionHeading: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#282c3f",
    margin: "0 0 16px 0",
    letterSpacing: "0.5px",
  },
  description: {
    fontSize: "1rem",
    color: "#535665",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
  },
  reviewsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  writeReviewBtn: {
    backgroundColor: "transparent",
    color: "#ff3e6c",
    border: "1px solid #ff3e6c",
    padding: "8px 16px",
    borderRadius: "4px",
    fontWeight: "600",
    cursor: "pointer",
  },
  reviewsList: { display: "flex", flexDirection: "column", gap: "20px" },
  noReviews: { color: "#7e818c", fontStyle: "italic", fontSize: "0.95rem" },
  reviewCard: {
    backgroundColor: "#fafbfc",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #eaeaec",
  },
  reviewCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  reviewStars: { color: "#14b8a6", letterSpacing: "2px", fontSize: "1.1rem" },
  reviewAuthor: { fontSize: "0.85rem", color: "#7e818c", fontWeight: "600" },
  reviewText: {
    fontSize: "0.95rem",
    color: "#282c3f",
    lineHeight: "1.5",
    margin: "0 0 10px 0",
  },
  reviewImage: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #eaeaec",
    marginTop: "8px",
  },
  similarSection: {
    marginTop: "60px",
    paddingTop: "40px",
    borderTop: "1px solid #eaeaec",
  },
  similarHeading: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#282c3f",
    marginBottom: "8px",
  },
  similarProductCard: {
    textDecoration: "none",
    color: "inherit",
    backgroundColor: "#fff",
    border: "1px solid #eaeaec",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  simImageWrap: {
    height: "220px",
    backgroundColor: "#f5f5f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
  },
  simImage: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  simInfo: { padding: "12px" },
  simBrand: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#282c3f",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  simTitle: {
    fontSize: "0.85rem",
    color: "#535665",
    marginBottom: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  simPrice: { fontSize: "0.95rem", fontWeight: "700", color: "#282c3f" },
  loader: {
    padding: "100px",
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#7e818c",
  },
  toastCard: {
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    gap: "14px",
  },
  toastImg: {
    width: "45px",
    height: "45px",
    objectFit: "contain",
    borderRadius: "4px",
    backgroundColor: "#f8fafc",
    padding: "2px",
  },
  toastTitle: {
    margin: "0 0 4px 0",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#0f172a",
  },
  toastSuccess: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#10b981",
    fontWeight: 700,
  },
};
