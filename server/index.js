// modules/packages imports
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

// file imports
import "./config/passport.js";
import authRouter from "./routes/auth/auth.route.js";
import oauthRouter from "./routes/auth/oauth.route.js";
import usersRouter from "./routes/user.route.js";
import bookingRouter from "./routes/bookings.route.js";
import addOnsRouter from "./routes/commerce/addons.route.js"
import paymentsRouter from "./routes/payments.route.js";
import couponsRouter from "./routes/commerce/coupons.route.js"

// middleware imports
import globalLimter from "./middleware/rateLimiter-global.js";
import requestId from "./middleware/request-id.js";
import paypalWebhookRouter from "./middleware/paypal-body-exception.js";
import requestStartLogger from './middleware/logging-reqstart.js';
import healthRoute from './routes/health.route.js';
import errorHandler from './middleware/errorHandler.js';

// admin imports
import adminAddonsRouter from "./routes/admin/admin-addons.route.js";
import adminBookingsRouter from "./routes/admin/admin-bookings.route.js";
import adminOrdersRouter from "./routes/admin/admin-orders.route.js";
import adminPaymentsRouter from "./routes/admin/admin-payments.route.js";
import adminProfileRouter from "./routes/admin/admin-profile.route.js";
import adminSecurityRouter from "./routes/admin/admin-security.route.js";
import adminUsersRouter from "./routes/admin/admin-users.route.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1)

app.use(requestId);

app.use(
    helmet({
        xFrameOptions: { action: "deny" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
); // makes it harder for attackers to exploit vulnerabilities

/*
app.use(helmet.hsts({
    maxAge: 600,
    includeSubDomains: true,
    preload: true
}));
*/

app.use(morgan('dev')); // logs HTTP requests

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        exposedHeaders: ["X-Request-Id"],
}));

app.use(globalLimter);

app.use(requestStartLogger);
app.use("/webhooks", paypalWebhookRouter);

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.json());

app.use(passport.initialize());

const PORT = process.env.PORT || 5050;

// GET health route
app.use(healthRoute);

// Backend Routes
app.use("/api/auth", authRouter);

console.log("Mounted /api/auth")

// app.use("/api/auth", oauthRouter);
app.use("/api/users", usersRouter);

console.log("Mounted /api/users")

app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/addons", addOnsRouter);
app.use("/api/coupons", couponsRouter);

// Admin Routes
app.use("/api/admin/addons", adminAddonsRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/payments", adminPaymentsRouter);
app.use("/api/admin/profile", adminProfileRouter);
app.use("/api/admin/security", adminSecurityRouter);
app.use("/api/admin/users", adminUsersRouter);

app.get("/" , (req, res) => {
    res.send("Server is running!");
});

// 404 error handler
app.use((req, res) => {
    return res.status(404).json({ message: "Page not found!" });
});

// centralized errorHandler
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});