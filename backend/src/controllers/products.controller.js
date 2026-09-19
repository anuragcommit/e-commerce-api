import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js"


const createProduct = asyncHandler(async (req, res) => {

    const { title, description, price, category, stock } = req.body;
    if (!title?.trim() || !description?.trim() || !price === undefined || !category?.trim()) {
        throw new ApiError(400, "Every field is requred");
    }

    if (Number(price) < 0) {
        throw new ApiError(400, "Price cannot be less than 0");
    }

    if (stock !== undefined && Number(stock) < 0) {
        throw new ApiError(400, "Stock cannot be less than 0");
    }

    const categoryCheck = await Category.findById(category);
    if (!categoryCheck) {
        throw new ApiError(404, "Category not found");
    }

    const createdProduct = await Product.create({
        title: title.trim(),
        description: description.trim() || "",
        price: Number(price),
        category: category.trim(),
        stock: Number(stock) || 0,
        seller: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            createdProduct,
            "Product created successfully"
        ));
});


const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    const { title, description, price, category, stock } = req.body;
    if (!title?.trim() && !description?.trim() && price === undefined && !category?.trim() && stock === undefined) {
        throw new ApiError(400, "Atleast one field is requred to update");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You cannot update this product");
    }

    const updateData = {};

    if (title?.trim()) {
        updateData.title = title.trim();
    }

    if (description?.trim()) {
        updateData.description = description.trim();
    }

    if (price !== undefined) {
        if (Number(price) < 0) {
            throw new ApiError(400, "Price cannot be less that 0")
        }
        updateData.price = Number(price);
    }

    if (stock !== undefined) {
        if (Number(stock) < 0) {
            throw new ApiError(400, "Stock cannot be less than 0");
        }
        updateData.stock = Number(stock);
    }

    if (category?.trim()) {
        const categoryCheck = await Category.findById(category.trim());
        if (!categoryCheck) {
            throw new ApiError(404, "Category not found");
        }
        updateData.category = category.trim();
    }


    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { returnDocument: "after", runValidators: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedProduct,
            "Product updated successfully"
        ));


});


const deleteProduct = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product id format");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden, You cannot delete this product");
    }

    await Product.findByIdAndDelete(productId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Product deleted successfully"
        ));


});


const getAllProducts = asyncHandler(async (req, res) => {
    const {
        search,
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc",
    } = req.query;

    const filter = {};

    if (search?.trim()) {
        filter.title = { $regex: search.trim(), $options: "i" }
    }

    if (category?.trim()) {
        if (!mongoose.Types.ObjectId.isValid(category.trim())) {
            throw new ApiError(400, "Invalid category id format");
        }
        filter.category = category.trim();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined && Number(minPrice) >= 0) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && Number(maxPrice) >= 0) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sortType.toLowerCase() === "asc" ? 1 : -1;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name email")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                products,
                pagination: {
                    totalProducts,
                    currentPage: pageNum,
                    totalPages,
                    limit: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            },
            "Product fetched successfully"
        ));
});


export {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
}