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