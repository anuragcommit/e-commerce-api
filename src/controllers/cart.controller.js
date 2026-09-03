import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


const addtoCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    const itemQuantity = Number(quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required")
    }

    if (isNaN(itemQuantity) || itemQuantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1")
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    if (product.stock < itemQuantity) {
        throw new ApiError(400, `Only ${product.stock} items are in stock`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] })
    }

    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());

    if (existingItemIndex > -1) {
        const updatedQuantity = cart.items[existingItemIndex].quantity + itemQuantity;

        if (updatedQuantity > product.stock) {
            throw new ApiError(400, `You have ${cart.items[existingItemIndex].quantity} in cart and available stock is ${product.stock}`)
        }

        cart.items[existingItemIndex].quantity = updatedQuantity;
    } else {
        cart.items.push({
            product: productId,
            quantity: itemQuantity,
            priceAtAddition: product.price
        });
    }

    await cart.save();

    await Cart.findById(cart._id).populate(
        {
            path: "items.product",
            select: "title price stock"
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            cart,
            "Item added to cart successfully"
        ));


});



const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
        {
            path: "items.product",
            select: "title price stock images"
        });

    if (!cart || cart.items.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    cartId: cart?._id || null,
                    items: [],
                    totalItems: 0,
                    cartTotal: 0
                },
                "Cart is empty"
            ));
    }


    const validItems = cart.items.filter((item) => item.product !== null);

    if (validItems.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    cartId: cart._id,
                    items: [],
                    totalItems: 0,
                    cartTotal: 0
                },
                "Cart is empty"
            )
            );
    }

    let totalItems = 0;
    const cartTotal = validItems.reduce((acc, item) => {
        totalItems += item.quantity;
        return acc + (item.product.price * item.quantity);
    }, 0);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                cartId: cart._id,
                items: validItems,
                totalItems,
                cartTotal
            },
            "Cart fetched successfully"
        ));



});


const updateCartQuantity = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const newQuantity = Number(quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid product id is required")
    }

    if (isNaN(newQuantity) || newQuantity < 1) {
        throw new ApiError(400, "Quantity must be atleast 1");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < newQuantity) {
        throw new ApiError(400, `Only ${product.stock} in stock`);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not found in cart");
    }

    cart.items[itemIndex].quantity = newQuantity;
    await cart.save();

    await cart.populate({
        path: "items.product",
        select: "title price stock images"
    });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            cart,
            "Quantity updated successfully in cart"
        ));
});



const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Valid productId is required");
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());

    if (cart.items.length === initialItemCount) {
        throw new ApiError(404, "Item not found in cart");
    }

    await cart.save();

    await cart.populate({
        path: "items.product",
        select: "title price stock images"
    });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            cart,
            "Item successfully removed from cart"
        ));
})


export {
    addtoCart,
    getCart,
    updateCartQuantity,
    removeFromCart,

}