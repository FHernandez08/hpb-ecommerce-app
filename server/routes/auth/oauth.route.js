import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const router = express.Router();

const isGoogleConfigured = 
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    !! process.env.GOOGLE_CALLBACK_URL;

const isMicrosoftConfigured = 
    !!process.env.MICROSOFT_CLIENT_ID &&
    !!process.env.MICROSOFT_CLIENT_SECRET &&
    !!process.env.MICROSOFT_CALLBACK_URL;

const isFacebookConfigured = 
    !!process.env.FACEBOOK_APP_ID &&
    !!process.env.FACEBOOK_APP_SECRET &&
    !!process.env.FACEBOOK_CALLBACK_URL;


// Google OAuth Functionality
router.get("/google", (req, res, next) => {
    if (!isGoogleConfigured) {
        return res.status(503).send("Google OAuth not configured!");
    }
    return passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state: true })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    if (!isGoogleConfigured) {
        return res.status(503).send("Google OAuth not configured!");
    }
    return passport.authenticate('google', {failureRedirect: `${CLIENT_URL}/login`, session: false }),
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
    }(req, res, next);
})

// Facebook OAuth Functionality
router.get("/facebook", (req, res, next) => {
    if (!isFacebookConfigured) {
        return res.status(503).send("Facebook OAuth not configured!");
    }
    return passport.authenticate('facebook', { scope: ['email'], state: true })(req, res, next);
})

router.get("/facebook/callback", (req, res, next) => {
    if (!isFacebookConfigured) {
        return res.status(503).send("Facebook OAuth not configured!");
    }
    return passport.authenticate("facebook", { failureRedirect: `${CLIENT_URL}/login`, session: false }),
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
    }(req, res, next);
});

// Microsoft OAuth Functionality
router.get("/microsoft", (req, res, next) => {
    if (!isMicrosoftConfigured) {
        return res.status(503).send("Microsoft OAuth not configured!");
    }
    return passport.authenticate('microsoft', {
        scope: ['user.Read'],
        prompt: 'select_account',
        state: true
    })(req, res, next);
});

router.get("/microsoft/callback", (req, res, next) => {
    if (!isMicrosoftConfigured) {
        return res.status(503).send("Microsoft OAuth not configured!");
    }
    return passport.authenticate('microsoft', { failureRedirect: `${CLIENT_URL}/login`, session: false }),
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
});

export default router;