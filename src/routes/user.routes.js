import { Router } from "express"; 
import { jwtVerify } from "../middlewares/auth.middleware.js"; 
import { registerUser, loginUser, logOutUser, refreshAccessToken, getCurrentUser, updateUserProfile, updateUserPassword, deleteUserAccount } from "../controllers/users.controller.js"; 

const router = Router();


router.route('/refresh-token').post(refreshAccessToken);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(jwtVerify, logOutUser);
router.route('/current-user').get(jwtVerify, getCurrentUser);
router.route('/update-account').patch(jwtVerify, updateUserProfile);
router.route('/update-password').post(jwtVerify, updateUserPassword);
router.route('/delete-account').post(jwtVerify, deleteUserAccount);


export default router;