import { Router } from "express";
import { authorizeRoles, jwtVerify } from "../middlewares/auth.middleware.js";
import { verifySeller } from "../middlewares/seller.middleware.js";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../controllers/products.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";


const router = Router();


router.route('/').get(getAllProducts);

//protected routes
router.route('/create-product').post(jwtVerify, verifySeller, createProduct);
router.route('/:productId').patch(jwtVerify, authorizeRoles("Seller", "admin"), updateProduct);
router.route('/:productId').delete(jwtVerify, authorizeRoles("admin", "seller"), deleteProduct);


export default router;