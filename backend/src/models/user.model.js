import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        enum: ['customer', 'seller', 'admin'],
        default: ['customer']
    },
    address: {
        type: [addressSchema]
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],
    tokenVersion: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, { timestamps: true });


export const User = mongoose.model("User", userSchema);