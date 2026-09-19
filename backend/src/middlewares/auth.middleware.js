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
            return next(new ApiError(401, "Authentication required"));
        }

        const isAllowed = allowedRoles.some((role) => req.user.roles?.includes(role));

        if (!isAllowed) {
            return next(new ApiError(403, "You do not have permission to perform this action"));
        }

        next();
    };
};


export { jwtVerify, authorizeRoles }