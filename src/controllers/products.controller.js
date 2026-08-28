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

    if ( Number(price) < 0) {
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


export {
    createProduct,
}