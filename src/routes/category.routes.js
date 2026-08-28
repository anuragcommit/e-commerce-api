import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controllers/categories.controller.js";
import { Router } from "express";   
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();


router.route('/get-category').get(getAllCategories);

//secured routes
router.route('/create-category').post(jwtVerify, verifyAdmin, createCategory);
router.route('/update-category/:categoryId').patch(jwtVerify, verifyAdmin, updateCategory);
router.route('/delete-category/:categoryId').post(jwtVerify, verifyAdmin, deleteCategory);



export default router;