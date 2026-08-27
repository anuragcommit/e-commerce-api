import "dotenv/config";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found for generating token");
        }

        const accessToken = jwt.sign({
            _id: user._id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign({
            _id: user._id
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating token");
    }
}


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized: Refresh Token not provided");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", newRefreshToken, { ...options, maxAge: 15 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access token refreshed successfully"
        ));
});



const registerUser = asyncHandler(async (req, res) => {

    const { name, phone, email, password, role } = req.body;

    if ((!email && !phone) || !name?.trim()) {
        throw new ApiError(400, "email or phone number and name is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (role === "admin") {
        throw new ApiError(403, "You are not allowed as a admin");
    }

    const existingUser = await User.findOne({
        $or: [
            ...(email ? [{ email: email.toLowerCase().trim() }] : []),
            ...(phone ? [{ phone: phone }] : [])
        ]
    });

    if (existingUser) {
        if (existingUser.email === email?.toLowerCase().trim() && existingUser.phone === phone) {
            throw new ApiError(409, "Phone number and email already in use")
        }

        if (existingUser.email === email?.toLowerCase().trim()) {
            throw new ApiError(409, "Email already in use");
        }

        if (existingUser.phone === phone) {
            throw new ApiError(409, "Phone already in use");
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        role: role || "customer",
        tokenVersion: 0
    });

    // console.log(user);

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
        );
});



const loginUser = asyncHandler(async (req, res) => {

    const { phone, email, password } = req.body;
    if (!phone && !email?.trim()) {
        throw new ApiError(400, "Email or phone number is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const queryConditions = [
        ...(email?.trim() ? [{ email: email.toLowerCase().trim() }] : []),
        ...(phone?.trim() ? [{ phone: phone.trim() }] : [])
    ];

    if (queryConditions.length === 0) {
        throw new ApiError(400, "Valid email or phone number is required");
    }

    const user = await User.findOne({ $or: queryConditions });

    // const user = await User.findOne({
    //     $or: [
    //         ...(email ? [{ email: email.toLowerCase().trim() }] : []),
    //         ...(phone ? [{ phone: phone }] : [])
    //     ]
    // });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...options, maxAge: 15 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                refreshToken,
                accessToken
            },
            "User logged in successfully"
        ));
});


const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { returnDocument: "after" }
    );

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200,
            {},
            "User logged out successfully"
        ));
});


const getCurrentUser = asyncHandler(async (req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        ));

});


const updateUserProfile = asyncHandler(async (req, res) => {

    const { name, email, phone, address } = req.body;
    const userId = req.user._id;

    if (!name?.trim() && !email?.trim() && !phone && !address) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const queryConditions = [
        ...(email?.trim() ? [{ email: email.toLowerCase().trim() }] : []),
        ...(phone ? [{ phone: phone }] : [])

    ];

    if (queryConditions.length > 0) {

        const existingUser = await User.findOne({
            _id: { $ne: userId },
            $or: queryConditions
        });

        if (existingUser) {
            if (existingUser.email === email && existingUser.phone === phone) {
                throw new ApiError(409, "Email and phone are already in use");
            }
            if (existingUser.email === email) {
                throw new ApiError(409, "Email already in use");
            }
            if (existingUser.phone === phone) {
                throw new ApiError(409, "Phone already is use");
            }
        }
    }

    const updateData = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUserDetails = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { returnDocument: "after", runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUserDetails) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUserDetails,
            "Account details updated successfully"
        ));

});


const updateUserPassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old Password and New Password is required");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password cannot be same as old password");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect old password");
    }

    const updatedPassword = await bcrypt.hash(newPassword, 10);

    user.password = updatedPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.refreshToken = null;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password updated successfully"
        ));
});


const deleteUserAccount = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const { password } = req.body;
    if (!password) {
        throw new ApiError(400, "Password is required to delete account");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password")
    }

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    await User.findByIdAndDelete(userId);

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(
            200,
            {},
            "Account deleted successfully"
        ));

});


const logoutFromAllDevice = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: null },
            $inc: { tokenVersion: 1 }
        },
        { returnDocument: "after" }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200,
            {},
            "User logged out from all devices"
        ));
});








export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserProfile,
    updateUserPassword,
    deleteUserAccount,
    logoutFromAllDevice

}