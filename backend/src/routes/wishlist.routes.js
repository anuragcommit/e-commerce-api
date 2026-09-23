import {Router} from "express";
import {jwtVerify} from "../middlewares/auth.middleware.js"
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";


const router = Router();


router.use(jwtVerify);

router.route('/').get(getWishlist).post(addToWishlist);
router.route('/remove/:productId').delete(removeFromWishlist);


export default router;