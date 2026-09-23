import { Router } from "express"; 
import { jwtVerify } from "../middlewares/auth.middleware.js"; 
import { registerUser, loginUser, logOutUser, refreshAccessToken, getUserProfile, updateUserProfile, updateUserPassword, deleteUserAccount, deleteUserById, becomeSeller, deleteSellerAccount, forgotPassword, addAddress, deleteAddress, updateAddress, getMyAddresses } from "../controllers/users.controller.js"; 
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();


router.route('/refresh-token').post(refreshAccessToken);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes
router.route('/become-seller').post(jwtVerify, becomeSeller);
router.route('/logout').post(jwtVerify, logOutUser);
router.route('/profile').get(jwtVerify, getUserProfile);
router.route('/addresses').post(jwtVerify, addAddress);
router.route('/addresses').get(jwtVerify, getMyAddresses);
router.route('/addresses/:addressId').delete(jwtVerify, deleteAddress);
router.route('/addresses/:addressId').patch(jwtVerify, updateAddress);
router.route('/update-account').patch(jwtVerify, updateUserProfile);
router.route('/update-password').post(jwtVerify, updateUserPassword);
router.route('/delete-account').post(jwtVerify, deleteUserAccount);
router.route('/delete-seller-account').delete(jwtVerify, deleteSellerAccount);
router.route('/forgot-password').post(forgotPassword);


//admin only
router.route('/:userId').delete(jwtVerify, verifyAdmin, deleteUserById);


export default router;