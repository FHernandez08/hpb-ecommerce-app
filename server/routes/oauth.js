import express from "express";
import passport from "passport";

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const router = express.Router();


// Google OAuth Functionality
router.get("/google", 
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state: true
     })
);

router.get("/google/callback",
    passport.authenticate('google', {failureRedirect: `${CLIENT_URL}/login`,
        session: true
     }),
    function (req, res) {
        res.redirect(`${CLIENT_URL}/dashboard`);
    }
)

// Facebook OAuth Functionality
router.get("/facebook", 
    passport.authenticate('facebook', { scope: ['email'], state: true })
)

router.get("/facebook/callback", 
    passport.authenticate("facebook", { failureRedirect: `${CLIENT_URL}/login`, session: true }),
    function (req, res) {
        res.redirect(`${CLIENT_URL}/dashboard`)
    }
)

// Microsoft OAuth Functionality
router.get("/microsoft",
    passport.authenticate('microsoft', {
        scope: ['User.Read'],
        prompt: 'select_account',
        state: true
    })
)

router.get("/microsoft/callback",
    passport.authenticate('microsoft', { failureRedirect: `${CLIENT_URL}/login`, session: true }),
    function (req, res) {
        res.redirect(`${CLIENT_URL}/dashboard`)
    }
)


export default router;