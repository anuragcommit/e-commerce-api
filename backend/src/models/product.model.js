import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Product title is required"],
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: [true, "Product description is requiered"],
    },
    price: {
        type: Number,
        required: [true, "Selling price is required"],
        min: [0, "Price cannot be negative"],
    },
    originalPrice: {
        type: Number,
        required: [true, "Original MRP is required"],
        min: [0, "Original price cannot be negative"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Product category is required"],
        lowercase: true,
        trim: true,
        index: true,
    },
    brand: {
        type: String,
        trim: true,
        default: "Generic"
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    images: [{
        type: String,
    }],
    rating: {
        type: Number,
        default: 4.2,
        min: [0, "Rating cannot be lower than 0"],
        max: [5, "Rating cannot exceed 5"]
    },
    numReviews: {
        type: Number,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });

productSchema.virtual("discountPercent").get(function () {
    if (!this.originalPrice || this.originalPrice <= this.price) return 0;
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });


export const Product = mongoose.model("Product", productSchema);