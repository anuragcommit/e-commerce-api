import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


export const verifyAdmin = asyncHandler(async (req, res, next) => {
    
    if(!req.user){
        throw new ApiError(401, "Unauthorized request. Please login first")
    }

    if(req.user.role !== "admin") {
        throw new ApiError(403, "Access denied. Only admins are allowed to perform this action");
    }

    next();
});