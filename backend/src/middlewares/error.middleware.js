import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // If it's a MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "Field";

        let message = "Duplicate field value entered.";
        if (field === "phone") {
            message = "Phone number already exists. Please login or use a different number.";
        } else if (field === "email") {
            message = "Email already exists. Please login or use a different email.";
        } else {
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
        }

        error = new ApiError(409, message);
    }

    // If it is NOT an instance of our ApiError class, convert it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message);
    }

    // Send the JSON response to React
    return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        errors: error.errors
    });
};

export { errorHandler };