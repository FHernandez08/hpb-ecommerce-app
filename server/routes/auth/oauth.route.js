import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const router = express.Router();


// Google OAuth Functionality
router.get("/google", 
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state: true
     })
);

router.get("/google/callback",
    passport.authenticate('google', {failureRedirect: `${CLIENT_URL}/login`, session: false }),
    function (req, res) {
        const payload = { sub: req.user.id, role: req.user.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        });

        res.cookie(process.env.ACCESS_TOKEN_COOKIE, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.COOKIE_SAMESITE,
                path: '/',
            }).redirect(`${CLIENT_URL}/dashboard`);
    }
)

// Facebook OAuth Functionality
router.get("/facebook", 
    passport.authenticate('facebook', { scope: ['email'], state: true })
)

router.get("/facebook/callback", 
    passport.authenticate("facebook", { failureRedirect: `${CLIENT_URL}/login`, session: false }),
    function (req, res) {
        const payload = { sub: req.user.id, role: req.user.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        });

        res.cookie(process.env.ACCESS_TOKEN_COOKIE, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.COOKIE_SAMESITE,
                path: '/',
            }).redirect(`${CLIENT_URL}/dashboard`);
    }
);

// Microsoft OAuth Functionality
router.get("/microsoft",
    passport.authenticate('microsoft', {
        scope: ['user.Read'],
        prompt: 'select_account',
        state: true
    })
)

router.get("/microsoft/callback",
    passport.authenticate('microsoft', { failureRedirect: `${CLIENT_URL}/login`, session: false }),
    function (req, res) {
        const payload = { sub: req.user.id, role: req.user.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        });

        res.cookie(process.env.ACCESS_TOKEN_COOKIE, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.COOKIE_SAMESITE,
                path: '/',
            }).redirect(`${CLIENT_URL}/dashboard`);
    }
);


export default router;