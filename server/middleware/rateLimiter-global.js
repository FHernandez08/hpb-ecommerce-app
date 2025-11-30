// GOAL: 100 requests/15m per IP; exempt health checks

import rateLimit from "express-rate-limit";

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
});

module.exports = globalLimiter;