// src/pages/WriteReviewPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function WriteReviewPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👈 Added state to track inline validation errors
  const [errors, setErrors] = useState({ rating: "", comment: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${productId}`);
        setProduct(res.data.data);
      } catch (err) {
        toast.error("Failed to load product details.");
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = { rating: "", comment: "" };
    let hasError = false;

    if (rating === 0) {
      newErrors.rating = "Please select a star rating.";
      hasError = true;
    }
    if (!comment.trim()) {
      newErrors.comment = "Please write a review before submitting.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsSubmitting(true);
    try {
      // 👈 Send standard JSON instead of FormData
      await API.post(`/reviews/product/${productId}`, {
        rating: rating,
        comment: comment,
      });

      toast.success("Review submitted successfully!");
      navigate(`/product/${productId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
      setIsSubmitting(false);
    }
  };

  if (!product) return <div style={styles.loader}>Loading...</div>;

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <h1 style={styles.header}>Create Review</h1>

        <div style={styles.productSnippet}>
          <img
            src={product.images?.[0] || "https://placehold.co/100"}
            alt={product.title}
            style={styles.snippetImg}
          />
          <span style={styles.snippetTitle}>{product.title}</span>
        </div>

        <div style={styles.divider} />

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <label style={styles.label}>Overall rating</label>
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  style={{
                    ...styles.starBtn,
                    color: star <= (hover || rating) ? "#ffb400" : "#e2e8f0",
                  }}
                  onClick={() => {
                    setRating(star);
                    setErrors({ ...errors, rating: "" }); // Clear error on click
                  }}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </button>
              ))}
            </div>
            {/* 👈 Inline error for rating */}
            {errors.rating && (
              <span style={styles.errorText}>{errors.rating}</span>
            )}
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <label style={styles.label}>Add a photo (optional)</label>
            <p style={styles.subtext}>
              Shoppers find images more helpful than text alone.
            </p>
            <div style={styles.fileUploadBox}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={styles.fileInput}
              />
              {image ? (
                <span style={styles.fileName}>📸 {image.name}</span>
              ) : (
                <span style={styles.uploadPlaceholder}>
                  Click to upload an image
                </span>
              )}
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <label style={styles.label}>Add a written review</label>
            <textarea
              placeholder="What did you like or dislike? What did you use this product for?"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim())
                  setErrors({ ...errors, comment: "" }); // Clear error on type
              }}
              style={{
                ...styles.textArea,
                borderColor: errors.comment ? "#ef4444" : "#cbd5e1",
              }}
            />
            {/* 👈 Inline error for comment */}
            {errors.comment && (
              <span style={{ ...styles.errorText, marginTop: "8px" }}>
                {errors.comment}
              </span>
            )}
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(`/product/${productId}`)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundColor: "#f1f5f9",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "650px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 24px 0",
  },
  productSnippet: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  snippetImg: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
    padding: "4px",
  },
  snippetTitle: {
    fontSize: "1rem",
    color: "#334155",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  divider: { height: "1px", backgroundColor: "#e2e8f0", margin: "24px 0" },
  form: { display: "flex", flexDirection: "column" },
  section: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "8px",
  },
  subtext: { fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px 0" },
  starContainer: { display: "flex", gap: "8px" },
  starBtn: {
    background: "none",
    border: "none",
    fontSize: "2.5rem",
    cursor: "pointer",
    padding: "0",
    transition: "color 0.1s",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginTop: "4px",
  },
  fileUploadBox: {
    border: "2px dashed #cbd5e1",
    borderRadius: "6px",
    padding: "24px",
    textAlign: "center",
    position: "relative",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  uploadPlaceholder: { color: "#64748b", fontWeight: "500" },
  fileName: { color: "#10b981", fontWeight: "600" },
  textArea: {
    width: "100%",
    minHeight: "120px",
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    color: "#334155",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "32px",
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "4px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  submitBtn: {
    padding: "12px 32px",
    backgroundColor: "#fb641b",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  loader: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
    fontSize: "1.1rem",
  },
};
