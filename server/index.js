// modules/packages imports
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import helmet from "helmet";
import bodyParser from "body-parser";

// file imports
import "./config/passport.js";
import authRouter from "./routes/auth/auth.route.js";
import oauthRouter from "./routes/auth/oauth.route.js";
import usersRouter from "./routes/user.route.js";
import bookingRouter from "./routes/bookings.route.js";
import paymentsRouter from "./routes/payments.route.js";
import globalLimter from "./middleware/rateLimiter-global.js";
import requestId from "./middleware/request-id.js";
import paypalWebhookRouter from "./middleware/paypal-body-exception.js";
import requestStartLogger from './middleware/logging-reqstart.js';
import healthRoute from './routes/health.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express();

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

app.use(express.json());

app.use(passport.initialize());

const PORT = process.env.PORT || 5000;

// GET health route
app.use(healthRoute);

// Backend Routes
app.use("/api/auth", authRouter);
app.use("/api/auth", oauthRouter);
app.use("/api/users", usersRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);

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