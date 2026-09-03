import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { addtoCart, getCart } from "../controllers/cart.controller.js";


const router = Router();


router.route('/add-to-cart').post(jwtVerify, addtoCart);
router.route('/getCart').post(jwtVerify, getCart)


export default router;