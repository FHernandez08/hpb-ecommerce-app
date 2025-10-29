import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from "express-session";
import passport from 'passport';
import "./config/passport.js"

dotenv.config();
const app = express();
app.use(morgan('dev')); // logs HTTP requests

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, sameSite: 'lax' }
}))

app.use(passport.initialize());
app.use(passport.session());

import authRouter from "./routes/auth/auth.js";
import oauthRouter from "./routes/auth/oauth.js";
import bookingRouter from "./routes/bookings/ booking.js";
import paymentsRouter from "./routes/payments/payment.js";

const PORT = process.env.PORT || 5000;
app.use("/auth", authRouter);
app.use("/auth", oauthRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentsRouter);

app.get("/" , (req, res) => {
    res.send("Server is running!");
});


// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});