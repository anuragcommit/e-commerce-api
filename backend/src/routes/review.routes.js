import { Router } from "express";   
import { addReview, deleteReview, getProductReviews } from "../controllers/review.controller.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/product/:productId').get(getProductReviews);

router.route('/product/:productId').post(jwtVerify, addReview);
router.route('/:reveiwId').delete(jwtVerify, deleteReview);


export default router;