import "dotenv/config";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"


const jwtVerify = asyncHandler(async (req, res, next) => {


    const token = req.cookies?.token || req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request: No token proveided");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token")
    }

    const user = await User.findById(decodedToken?._id || decodedToken?.id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(401, "Invalid Access Token: User not found");
    }

    if (user.tokenVersion !== decodedToken.tokenVersion) {
        throw new ApiError(401, "Session expired, please login again");
    }

    req.user = user;
    next();
});



const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized: Please log in first");
        }

        // Normalize allowed roles to lowercase
        const allowed = allowedRoles.map((r) => r.toLowerCase());

        // Extract user's roles from either array or string
        let userRoles = [];
        if (Array.isArray(req.user.roles)) {
            userRoles = req.user.roles.map((r) => String(r).toLowerCase());
        }
        if (req.user.role) {
            userRoles.push(String(req.user.role).toLowerCase());
        }

        // Check if user has at least one matching role
        const hasPermission = userRoles.some((role) => allowed.includes(role));

        if (!hasPermission) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }

        next();
    };
};

export { jwtVerify, authorizeRoles }