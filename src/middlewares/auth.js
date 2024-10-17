import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from '../utils/asynchandler.js';
import jwt from "jsonwebtoken";


const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return next(new ApiError(401, "Access token is missing or invalid"));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decodedToken?.id;
        next();
    } catch (error) {
        return next(new ApiError(401, "Invalid access token"));
    }
});
export { verifyJWT };
