import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js"; 
import { db } from "../db/server.js";

const {User} = db;

const adminAccess = asyncHandler(async (req, res, next) => {
    const userId = req.userId; 

    if (!userId) {
        return next(new ApiError(401, "Unauthorized: No user ID provided"));
    }

    const user = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
    });

    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    if (user.role !== 'admin') {
        return next(new ApiError(403, "Access denied: Admins only"));
    }

    res.status(200).json({
        message: "Welcome, Admin.",
    });
});


const userAccess = asyncHandler(async (req, res, next) => {
    const userId = req.userId; 

    if (!userId) {
        return next(new ApiError(401, "Unauthorized: No user ID provided"));
    }

    const user = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
    });

    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    if (user.role !== 'user') {
        return next(new ApiError(403, "Access denied: Admins only"));
    }

    res.status(200).json({
        message: "Welcome, user.",
    });
});

export { adminAccess, userAccess };
