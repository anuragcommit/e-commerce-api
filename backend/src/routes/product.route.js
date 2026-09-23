import { Router } from "express";
import { authorizeRoles, jwtVerify } from "../middlewares/auth.middleware.js";
import { verifySeller } from "../middlewares/seller.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, getSellerProducts, updateProduct } from "../controllers/products.controller.js";


const router = Router();


router.route('/').get(getAllProducts);
router.route('/seller/my-products').get(jwtVerify, verifySeller, getSellerProducts);
router.route('/:id').get(getProductById);

//protected routes
router.route('/create-product').post(jwtVerify, verifySeller, createProduct);
router.route('/:productId').patch(jwtVerify, authorizeRoles("Seller", "admin"), updateProduct);
router.route('/:productId').delete(jwtVerify, authorizeRoles("admin", "seller"), deleteProduct);


export default router;