import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js"; 

const adminAccess = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'admin') {
        return next(new ApiError(403, "Access denied: Admins only"));
    }

    res.status(200).json({
        message: "Welcome, Admin."
    });
});

const userAccess = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'user') {
        return next(new ApiError(403, "Access denied: Users only"));
    }

    res.status(200).json({
        message: "Welcome, User."
    });
});

export { adminAccess, userAccess };
