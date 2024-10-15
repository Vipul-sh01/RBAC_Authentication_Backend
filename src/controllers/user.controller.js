import { asyncHandler } from '../utils/asynchandler.js'; 
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../db/server.js';
import { Op } from 'sequelize';

const { User } = db;

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if ([username, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ username }, { email }],
        },
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const newUser = await User.create({
        username,
        email,
        password, 
    });

    const createdUser = await User.findByPk(newUser.id, {
        attributes: { exclude: ['password', 'refreshToken'] },
    });

    if (!createdUser) {
        throw new ApiError(500, "Error while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export { registerUser };
