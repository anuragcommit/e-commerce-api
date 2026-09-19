import mongoose from "mongoose";
import { addressSchema } from "./user.model.js";


const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    title: {
        type: String,
        required: true,

    },
    price: {
        type: Number,
        required: true,

    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { _id: false }
);

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
    },
    shippingAddress: {
        type: addressSchema,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing',
    },
}, { timestamps: true });


export const Order = mongoose.model("Order", orderSchema);