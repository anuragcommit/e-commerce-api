import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import mongoose from "mongoose";



// Helper function to re-aggregate and sync product metrics
const updateProductRatingMetrics = async (productId) => {
    const stats = await Review.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(productId) }
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: stats[0].totalReviews
        });
    } else {
        // Fallback if all reviews were deleted
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            totalReviews: 0
        });
    }
};


const addReview = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required");
    }

    if (!Number(rating) || Number(rating) > 5 || Number(rating) < 1) {
        throw new ApiError(400, "Rating must be a valid number between 1 to 5");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const hasDelivered = await Order.findOne({
        customer: userId,
        orderStatus: "delivered",
        "items.product": productId
    });

    if (!hasDelivered) {
        throw new ApiError(400, "You can only review the item that have been delivered to you");
    }

    const review = await Review.findOneAndUpdate(
        { user: userId, product: productId },
        { rating: numericRating, comment },
        { new: true, upsert: true, runValidators: true }
    );

    await updateProductRatingMetrics(productId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            review,
            "Review submitted successfully"
        ));
});



const getProductReviews = asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required");
    }

    const reviews = await Review.find({ product: productId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            reviews,
            "Product reviews fetched successfully"
        ));
})


const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { _id: userId, role } = req.user;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ApiError(400, "Valid review id is required");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== userId.toString() && role !== "admin") {
        throw new ApiError(403, "You don't have permission to delete this review");
    }

    const productId = review.product;
    await review.deleteOne();

    await updateProductRatingMetrics(productId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Review deleted successfully"
        ))
});




export {
    addReview,
    getProductReviews,
    deleteReview,
}