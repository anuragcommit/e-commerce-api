import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { verifySeller } from "../middlewares/seller.middleware.js";
import { createProduct } from "../controllers/products.controller.js";


const router = Router();


router.route('/create-product').post(jwtVerify, verifySeller, createProduct);


export default router;