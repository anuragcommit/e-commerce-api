import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const verifySeller = asyncHandler(async (req, res, next) => {
    console.log(2)
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request. Please login first");
    }

    if (req.user.role !== "seller" && req.user.role !== "admin") {
        throw new ApiError(403, "Access denied. Only sellers can perform this action");
    }

    next();
});