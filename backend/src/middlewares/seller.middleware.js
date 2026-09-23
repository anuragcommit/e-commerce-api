import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const verifySeller = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request. Please login first");
    }

const hasSellerRoleInArray = Array.isArray(req.user.roles) && req.user.roles.some(
        (r) => r.toLowerCase() === "seller" || r.toLowerCase() === "admin"
    );

    // 2. Fallback check for single string: req.user.role
    const hasSellerRoleInString = 
        req.user.role?.toLowerCase() === "seller" || 
        req.user.role?.toLowerCase() === "admin";

    if (!hasSellerRoleInArray && !hasSellerRoleInString) {
        throw new ApiError(403, "Access denied. Only sellers can perform this action");
    }

    next();
});