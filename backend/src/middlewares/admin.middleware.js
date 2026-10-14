import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


export const verifyAdmin = asyncHandler(async (req, res, next) => {
    
    if(!req.user){
        throw new ApiError(401, "Unauthorized request. Please login first")
    }

    const isAdmin = req.user?.roles?.includes("admin") || req.user?.role === "admin";

    if(!isAdmin) {
        throw new ApiError(403, "Access denied. Only admins are allowed to perform this action");
    }

    next();
});