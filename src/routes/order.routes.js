import { Router } from "express";
import {jwtVerify} from "../middlewares/auth.middleware.js"
import { getMyOrders, getOrderById, placeOrder } from "../controllers/order.controller.js";


const router = Router();

router.use(jwtVerify);

router.route('/create-order').post(placeOrder);
router.route('/my-orders').get(getMyOrders);
router.route('/:orderId').get(getOrderById);


export default router;