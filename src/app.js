import express from 'express';
import { ApiError } from './utils/ApiError.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true,
}));

app.use(express.json({ limit: '18kb' }));
app.use(express.urlencoded({ limit: '18kb', extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

import userRouter from '../src/routers/user.routes.js';
app.use('/api/v1/users', userRouter);

import protectedRoutes from '../src/routers/protected.routes.js';
app.use('/api/v1/admin', protectedRoutes);

import protectedRoute from '../src/routers/protected.routes.js';
app.use('/api/v1/user', protectedRoute);


app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});


app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.toJson());
    }
    console.error(err.stack);
    return res.status(500).json({ message: 'Internal Server Error' });
});

export { app };
