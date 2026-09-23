import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js"


// const createProduct = asyncHandler(async (req, res) => {

//     const { title, description, price, category, stock } = req.body;
//     if (!title?.trim() || !description?.trim() || !price === undefined || !category?.trim()) {
//         throw new ApiError(400, "Every field is requred");
//     }

//     if (Number(price) < 0) {
//         throw new ApiError(400, "Price cannot be less than 0");
//     }

//     if (stock !== undefined && Number(stock) < 0) {
//         throw new ApiError(400, "Stock cannot be less than 0");
//     }

//     const categoryCheck = await Category.findById(category);
//     if (!categoryCheck) {
//         throw new ApiError(404, "Category not found");
//     }

//     const createdProduct = await Product.create({
//         title: title.trim(),
//         description: description.trim() || "",
//         price: Number(price),
//         category: category.trim(),
//         stock: Number(stock) || 0,
//         seller: req.user._id,
//     });

//     return res
//         .status(201)
//         .json(new ApiResponse(
//             201,
//             createdProduct,
//             "Product created successfully"
//         ));
// });


// const getProductById = asyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//         throw new ApiError(404, "Product not found");
//     }
//     return res.status(200).json(new ApiResponse(200, product, "Product details retrieved"));
// });


// const updateProduct = asyncHandler(async (req, res) => {
//     const productId = req.params.productId;

//     const { title, description, price, category, stock } = req.body;
//     if (!title?.trim() && !description?.trim() && price === undefined && !category?.trim() && stock === undefined) {
//         throw new ApiError(400, "Atleast one field is requred to update");
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//         throw new ApiError(404, "Product not found");
//     }

//     if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
//         throw new ApiError(403, "You cannot update this product");
//     }

//     const updateData = {};

//     if (title?.trim()) {
//         updateData.title = title.trim();
//     }

//     if (description?.trim()) {
//         updateData.description = description.trim();
//     }

//     if (price !== undefined) {
//         if (Number(price) < 0) {
//             throw new ApiError(400, "Price cannot be less that 0")
//         }
//         updateData.price = Number(price);
//     }

//     if (stock !== undefined) {
//         if (Number(stock) < 0) {
//             throw new ApiError(400, "Stock cannot be less than 0");
//         }
//         updateData.stock = Number(stock);
//     }

//     if (category?.trim()) {
//         const categoryCheck = await Category.findById(category.trim());
//         if (!categoryCheck) {
//             throw new ApiError(404, "Category not found");
//         }
//         updateData.category = category.trim();
//     }


//     const updatedProduct = await Product.findByIdAndUpdate(
//         productId,
//         { $set: updateData },
//         { returnDocument: "after", runValidators: true }
//     );

//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             updatedProduct,
//             "Product updated successfully"
//         ));


// });


// const deleteProduct = asyncHandler(async (req, res) => {

//     const { productId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//         throw new ApiError(400, "Invalid product id format");
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//         throw new ApiError(404, "Product not found");
//     }

//     if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
//         throw new ApiError(403, "Forbidden, You cannot delete this product");
//     }

//     await Product.findByIdAndDelete(productId);

//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             {},
//             "Product deleted successfully"
//         ));


// });


// const getAllProducts = asyncHandler(async (req, res) => {
//     const {
//         search,
//         category,
//         minPrice,
//         maxPrice,
//         page = 1,
//         limit = 10,
//         sortBy = "createdAt",
//         sortType = "desc",
//     } = req.query;

//     const filter = {};

//     if (search?.trim()) {
//         filter.title = { $regex: search.trim(), $options: "i" }
//     }

//     if (category?.trim()) {
//         if (!mongoose.Types.ObjectId.isValid(category.trim())) {
//             throw new ApiError(400, "Invalid category id format");
//         }
//         filter.category = category.trim();
//     }

//     if (minPrice !== undefined || maxPrice !== undefined) {
//         filter.price = {};
//         if (minPrice !== undefined && Number(minPrice) >= 0) {
//             filter.price.$gte = Number(minPrice);
//         }
//         if (maxPrice !== undefined && Number(maxPrice) >= 0) {
//             filter.price.$lte = Number(maxPrice);
//         }
//     }

//     const pageNum = Math.max(1, parseInt(page, 10));
//     const limitNum = Math.max(1, parseInt(limit, 10));
//     const skip = (pageNum - 1) * limitNum;
//     const sortOrder = sortType.toLowerCase() === "asc" ? 1 : -1;

//     const totalProducts = await Product.countDocuments(filter);

//     const products = await Product.find(filter)
//         .populate("category", "name slug")
//         .populate("seller", "name email")
//         .sort({ [sortBy]: sortOrder })
//         .skip(skip)
//         .limit(limitNum);

//     const totalPages = Math.ceil(totalProducts / limitNum);

//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             {
//                 products,
//                 pagination: {
//                     totalProducts,
//                     currentPage: pageNum,
//                     totalPages,
//                     limit: limitNum,
//                     hasNextPage: pageNum < totalPages,
//                     hasPrevPage: pageNum > 1
//                 }
//             },
//             "Product fetched successfully"
//         ));
// });



// @desc    Create a product (Seller/Admin only)
// @route   POST /api/products/create-product


const createProduct = asyncHandler(async (req, res) => {
    const { title, description, price, originalPrice, category, stock, brand, images } = req.body;

    if (!title?.trim() || !description?.trim() || price === undefined || !category) {
        throw new ApiError(400, "Title, description, price, and category are required");
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
        throw new ApiError(400, "Price must be a valid non-negative number");
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
        throw new ApiError(400, "Stock cannot be negative");
    }

    // Handle category lookup by ObjectId or by Slug/Name
    let categoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
    } else {
        categoryDoc = await Category.findOne({
            $or: [
                { slug: String(category).toLowerCase().trim() },
                { name: new RegExp(`^${String(category).trim()}$`, "i") }
            ]
        });
    }

    if (!categoryDoc) {
        throw new ApiError(404, "Category not found");
    }

    const createdProduct = await Product.create({
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        originalPrice: originalPrice ? Number(originalPrice) : numericPrice,
        category: categoryDoc._id,
        brand: brand?.trim() || "Generic",
        images: Array.isArray(images) && images.length > 0 ? images : ["https://placehold.co/400x400?text=Product"],
        stock: stock !== undefined ? Number(stock) : 10,
        seller: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, createdProduct, "Product created successfully")
    );
});

// @desc    Get all products with dynamic search, category, pricing, sorting & pagination

const getAllProducts = asyncHandler(async (req, res) => {
    const {
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        sortBy = "createdAt",
        sortType = "desc",
        page = 1,
        limit = 12,
    } = req.query;

    const filter = {};

    // 1. Full-text search on title, description, or brand
    if (search?.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [{ title: regex }, { description: regex }, { brand: regex }];
    }

    // 2. Category matching (supports both ObjectId and string slugs/names)
if (category?.trim() && category !== "all") {
    if (mongoose.Types.ObjectId.isValid(category.trim())) {
        filter.category = category.trim();
    } else {
        // Match case-insensitively against name or slug
        const foundCategory = await Category.findOne({
            $or: [
                { slug: new RegExp(`^${category.trim()}$`, "i") },
                { name: new RegExp(`^${category.trim()}$`, "i") }
            ]
        });

        if (foundCategory) {
            filter.category = foundCategory._id;
        } else {
            // If the category doesn't exist, return empty list rather than all products
            filter.category = new mongoose.Types.ObjectId(); 
        }
    }
}
    // 3. Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined && Number(minPrice) >= 0) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && Number(maxPrice) >= 0) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // 4. Sorting rules (friendly shorthand compatibility)
    let sortOptions = {};
    if (sort === "price_asc") sortOptions = { price: 1 };
    else if (sort === "price_desc") sortOptions = { price: -1 };
    else if (sort === "rating") sortOptions = { rating: -1 };
    else {
        const sortOrder = sortType.toLowerCase() === "asc" ? 1 : -1;
        sortOptions[sortBy] = sortOrder;
    }

    // 5. Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.status(200).json(
        new ApiResponse(
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
            "Products fetched successfully"
        )
    );
});

// @desc    Get single product by ID
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID format");
    }

    const product = await Product.findById(id)
        .populate("category", "name slug")
        .populate("seller", "name email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product details retrieved successfully")
    );
});

// @desc    Update product (Owner seller or Admin)
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID format");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Verify ownership or admin privileges
    const isOwner = product.seller?.toString() === req.user._id?.toString();
    const isAdmin = req.user.role === "admin" || req.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "Forbidden: You are not authorized to update this product");
    }

    const { title, description, price, category, stock, brand, images } = req.body;
    const updateData = {};

    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (brand?.trim()) updateData.brand = brand.trim();
    if (Array.isArray(images) && images.length > 0) updateData.images = images;

    if (price !== undefined) {
        if (Number(price) < 0) throw new ApiError(400, "Price cannot be less than 0");
        updateData.price = Number(price);
    }

    if (stock !== undefined) {
        if (Number(stock) < 0) throw new ApiError(400, "Stock cannot be less than 0");
        updateData.stock = Number(stock);
    }

    if (category) {
        let categoryDoc = null;
        if (mongoose.Types.ObjectId.isValid(category)) {
            categoryDoc = await Category.findById(category);
        } else {
            categoryDoc = await Category.findOne({
                $or: [
                    { slug: String(category).toLowerCase().trim() },
                    { name: new RegExp(`^${String(category).trim()}$`, "i") }
                ]
            });
        }

        if (!categoryDoc) throw new ApiError(404, "Category not found");
        updateData.category = categoryDoc._id;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { returnDocument: "after", runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    );
});

// @desc    Delete product (Owner seller or Admin)
// @route   DELETE /api/products/:productId
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID format");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const isOwner = product.seller?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "Forbidden: You are not authorized to delete this product");
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});

const getSellerProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id })
        .populate("category", "name slug")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, products, "Seller listings retrieved successfully")
    );
});

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getSellerProducts,
};

