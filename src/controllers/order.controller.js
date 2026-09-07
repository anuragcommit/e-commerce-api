import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";



const placeOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { shippingAddress } = req.body;
    if (!shippingAddress) {
        throw new ApiError(400, "Shipping address is required");
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = item.product;

        if (!product) {
            throw new ApiError(400, "Some product in your cart is no longer available");
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for ${product.title}. Only ${product.stock} left in stock`);
        }

        orderItems.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity: item.quantity,
            seller: product.seller,
        });

        totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
        customer: userId,
        items: orderItems,
        shippingAddress,
        totalAmount,
        paymentStatus: "pending",
        orderStatus: "processing",
    });

    for (const item of cart.items) {
        await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: -item.quantity } }
        )
    }

    cart.items = [];
    await cart.save();

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            order,
            "Order placed successfully"
        ));
});


const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const orders = await Order.find({ customer: userId })
        .sort({ createdAt: -1 })
        .select("-__v");


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            orders,
            "Orders fetched successfully"
        ));
});


const getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const orderId = req.params.orderId;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Valid order id is required");
    }

    const order = await Order.findOne(
        {
            _id: orderId,
            customer: userId
        }).populate({
            path: "items.seller",
            select: "username email"
        });

        if (!order) {
        throw new ApiError(404, "Order not found or you do not have permission to view it");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            order,
            "Order fetched successfully"
        ));


});


export {
    placeOrder,
    getMyOrders,
    getOrderById,
}