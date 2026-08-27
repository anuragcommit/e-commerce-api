import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    images: [{
        type: String,
    }],

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });


export const Product = mongoose.model("Product", productSchema);