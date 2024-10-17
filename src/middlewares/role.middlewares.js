import { db } from "../db/server.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

const { User } = db;

const roleAuth = (roles) => {
    return asyncHandler(async (req, res, next) => {
        const userId = req.userId;

        if (!userId) {
            return next(new ApiError(401, "Unauthorized: No user ID provided"));
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        if (!roles.includes(user.role)) {
            return next(new ApiError(403, "Access denied"));
        }

        next();
    });
};

export {roleAuth};