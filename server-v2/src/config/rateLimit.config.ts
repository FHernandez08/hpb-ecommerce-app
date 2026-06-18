import rateLimit from "express-rate-limit";

// global limiter
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests... please try again in 15 minutes!',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false
});

// auth routes limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many requests while trying to login or register... please try again in 15 minutes!',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false
});