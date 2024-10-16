import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../db/server.js';
import { Op } from 'sequelize';

const { User } = db;

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Token generation failed");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error during token generation:", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
};

const allowedRoles = ['admin', 'user'];

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

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

    const userRole = role && allowedRoles.includes(role) ? role : 'user';

    const newUser = await User.create({
        username,
        email,
        password,
        role: userRole,
    });

    const createdUser = await User.findByPk(newUser.id, {
        attributes: { exclude: ['password'] },
    });

    if (!createdUser) {
        throw new ApiError(500, "Error while registering user");
    }

    const tokens = await generateAccessTokenAndRefreshToken(newUser.id);
    return res.status(201).json(
        new ApiResponse(201, { createdUser, tokens }, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const user = await User.findOne({
        where: {
            username,
        },
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user.id);

    const loggedInUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] },
    });

    const options = {
        httpOnly: true,
        secure: true, 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});


export { registerUser, loginUser };
