// src/pages/ProductDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext"; // 👈 Pull in your context

export default function ProductDetailsPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");
    
    // 👈 Extract addToCart from your context
    const { addToCart } = useCart(); 

    const loadData = async () => {
        try {
            const prodRes = await API.get(`/products/${productId}`);
            setProduct(prodRes.data.data);
            const reviewRes = await API.get(`/reviews/product/${productId}`);
            setReviews(reviewRes.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, [productId]);

    const handleAddToCart = async () => {
        try {
            // Let your Context handle the API call and updating the badge count
            await addToCart(product);
            alert("Added to cart successfully!");
        } catch (err) {
            alert("Failed to add to cart");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setReviewMessage("");
        try {
            await API.post(`/reviews/product/${productId}`, { rating: Number(rating), comment });
            setReviewMessage("Review submitted successfully!");
            setComment("");
            loadData();
        } catch (err) {
            setReviewMessage(err.response?.data?.message || "Failed to submit review");
        }
    };

    if (!product) return <p style={{ padding: "20px" }}>Loading product details...</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 16px" }}>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <h3>Price: ₹{product.price}</h3>
            <p><strong>Stock Available:</strong> {product.stock}</p>
            <p><strong>⭐ Average Rating:</strong> {product.averageRating || 0} / 5 ({product.totalReviews || 0} reviews)</p>

            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
                <button 
                    type="button" 
                    onClick={handleAddToCart}
                    disabled={product.stock < 1}
                    style={{ 
                        padding: "12px 24px", 
                        backgroundColor: product.stock < 1 ? "#ccc" : "#ff9f00", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        cursor: product.stock < 1 ? "not-allowed" : "pointer" 
                    }}
                >
                    {product.stock < 1 ? "Out of Stock" : "🛒 Add to Cart"}
                </button>
            </div>

            <hr style={{ margin: "24px 0" }} />
            <h3>Write a Review</h3>
            {reviewMessage && <p style={{ color: reviewMessage.includes("success") ? "green" : "red" }}>{reviewMessage}</p>}
            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
                <div>
                    <label>Rating (1 to 5): </label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: "6px" }}>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                    </select>
                </div>
                <textarea placeholder="Write your feedback..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ padding: "8px" }} />
                <button type="submit" style={{ padding: "8px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Submit Review
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />
            <h3>Customer Reviews</h3>
            {reviews.length === 0 ? (
                <p>No reviews yet for this product.</p>
            ) : (
                reviews.map((rev) => (
                    <div key={rev._id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                        <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
                            {rev.user?.username || rev.user?.fullName || rev.user?.name || "Verified Buyer"}
                        </p>
                        <p style={{ margin: "0 0 4px 0", color: "#d69e2e" }}>
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)} ({rev.rating}/5)
                        </p>
                        <p style={{ margin: 0 }}>{rev.comment}</p>
                    </div>
                ))
            )}
        </div>
    );
}