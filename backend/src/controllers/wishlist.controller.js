// controllers/wishlist.controller.js
import mongoose from "mongoose";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "items.product",
        select: "title price originalPrice brand images stock"
    });

    // If wishlist doesn't exist yet, return an empty one
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});

// Add item to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
        wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Check if product is already in the wishlist
    const itemExists = wishlist.items.some(
        (item) => item.product.toString() === productId.toString()
    );

    if (!itemExists) {
        wishlist.items.push({ product: productId });
        await wishlist.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, wishlist, "Item added to wishlist"));
});

// Remove item from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required");
    }

    // Use $pull to atomically remove the item matching the productId
    const wishlist = await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: productId } } },
        { returnDocument: 'after' }
    ).populate({
        path: "items.product",
        select: "title price originalPrice brand images stock"
    });

    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, wishlist, "Item removed from wishlist"));
});