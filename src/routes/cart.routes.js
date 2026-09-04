import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { addtoCart, clearCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";


const router = Router();


router.route('/add-to-cart').post(jwtVerify, addtoCart);
router.route('/getCart').get(jwtVerify, getCart);
router.route('/remove/:productId').delete(jwtVerify, removeFromCart);
router.route('/update-quantity').patch(jwtVerify, updateCartQuantity);
router.route('/clear-cart').delete(jwtVerify, clearCart);


export default router;