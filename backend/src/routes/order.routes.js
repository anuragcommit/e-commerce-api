import { Router } from "express";
import {authorizeRoles, jwtVerify} from "../middlewares/auth.middleware.js"
import { cancelOrder, getMyOrders, getOrderById, placeOrder, updateOrderStatus } from "../controllers/order.controller.js";


const router = Router();

router.use(jwtVerify);

router.route('/create-order').post(placeOrder);
router.route('/my-orders').get(getMyOrders);
router.route('/:orderId').get(getOrderById);
router.route('/cancel-order/:orderId').patch(cancelOrder);
router.route('/update-status/:orderId').patch(jwtVerify, authorizeRoles("admin", "seller"), updateOrderStatus);


export default router;