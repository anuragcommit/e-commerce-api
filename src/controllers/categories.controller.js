import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {

    const { name, description } = req.body;
    if (!name?.trim()) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
        throw new ApiError(409, "Category with this name already exist ");
    }

    const category = await Category.create({
        name: name.trim(),
        description: description?.trim() || "",
        createdBy: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            category,
            "Category created successfully"
        ));
});

const getAllCategories = asyncHandler(async (req, res) => {

    const allCategories = await Category.find({}).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            allCategories,
            "Categories fetched successfully"
        ));
});


const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!name?.trim() && !description?.trim()) {
        throw new ApiError(400, "Atleast one field is required to update");
    }

    const updateData = {};
    if (name?.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { $set: updateData },
        { returnDocument: "after" }
    );

    if (!updatedCategory) {
        throw new ApiError(404, "Category not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedCategory,
            "Category details updated successfully"
        ));
});


const deleteCategory = asyncHandler(async (req, res) => {
    const {categoryId} = req.params;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
        throw new ApiError(404, "Category not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Category deleted successfully"
        ));
});


export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,

}