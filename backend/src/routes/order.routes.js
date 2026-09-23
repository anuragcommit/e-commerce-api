import { Router } from "express";
import {authorizeRoles, jwtVerify} from "../middlewares/auth.middleware.js"
import { cancelOrder, getMyOrders, getOrderById, placeOrder, updateOrderStatus } from "../controllers/order.controller.js";


const router = Router();

router.use(jwtVerify);

router.route('/').post(placeOrder);
router.route('/').get(getMyOrders);
router.route('/:orderId').get(getOrderById);
router.route('/cancel/:orderId').patch(cancelOrder);
router.route('/update-status/:orderId').patch( authorizeRoles("admin", "seller"), updateOrderStatus);


export default router;
