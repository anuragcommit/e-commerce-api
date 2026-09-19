import { Router } from "express"; 
import { jwtVerify } from "../middlewares/auth.middleware.js"; 
import { registerUser, loginUser, logOutUser, refreshAccessToken, getCurrentUser, updateUserProfile, updateUserPassword, deleteUserAccount, deleteUserById, becomeSeller, deleteSellerAccount } from "../controllers/users.controller.js"; 
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();


router.route('/refresh-token').post(refreshAccessToken);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes
router.route('/become-seller').post(jwtVerify, becomeSeller);
router.route('/logout').post(jwtVerify, logOutUser);
router.route('/current-user').get(jwtVerify, getCurrentUser);
router.route('/update-account').patch(jwtVerify, updateUserProfile);
router.route('/update-password').post(jwtVerify, updateUserPassword);
router.route('/delete-account').post(jwtVerify, deleteUserAccount);
router.route('/delete-seller-account').delete(jwtVerify, deleteSellerAccount);


//admin only
router.route('/:userId').delete(jwtVerify, verifyAdmin, deleteUserById);


export default router;