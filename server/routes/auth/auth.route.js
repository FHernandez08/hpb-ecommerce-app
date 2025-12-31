import express from "express";
import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import validateData from "../../middleware/validation.js";
import registerSchema from "../../validation/auth/register.schema.js";
import { findByEmail, createUser } from "../../db/userFunctions.js";
import loginSchema from "../../validation/auth/login.schema.js";
import getTokenFrom from "../../middleware/getTokenFrom.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";
import attachUser from "../../middleware/attachUser.js";
import { ensureAuth } from "../../middleware/ensure.js";

const router = express.Router();


// auth register route - POST
router.post("/register", validateData(registerSchema), async (req, res, next) => {
    const { email, password, first_name, last_name } = req.body;
    const trimmedEmail = email.trim();
    const saltRounds = 10;

    const existing = await findByEmail(trimmedEmail);

    if (existing !== null) {
        if (existing.provider !== 'local') {
            return res.status(409).json({ message: "Account exists via OAuth; sign in with provider." });
        }
        else {
            return res.status(409).json({ message: "Email is already registered!" });
        }
    }

    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({email: trimmedEmail, password_hash, first_name, last_name, avatar_url: null});

    const payload = { sub: newUser.id, role: newUser.role }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    res.cookie(process.env.ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAMESITE,
        path: '/',
    });

    const { _password_hash, ...updatedUser } = newUser;
    return res.status(201).json({ updatedUser, token });
});

// auth login route - POST
router.post("/login", validateData(loginSchema), async (req, res, next) => {
    const { password, email } = req.body;
    const trimmedEmail = email.trim();

    const existingUser = await findByEmail(trimmedEmail);

    if (!existingUser) {
        return res.status(401).json({ message: "Invalid email or password. Please try again!" });
    }
    else if (existingUser.provider !== 'local') {
        return res.status(401).json({ message: "Please login using the OAuth provider connected to this email!"});
    }
    else {
        const isMatch = await bcrypt.compare(password, existingUser.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password. Please try again!" });
        }
        else {
            const payload = { sub: existingUser.id, role: existingUser.role }
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
            );

            res.cookie(process.env.ACCESS_TOKEN_COOKIE, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.COOKIE_SAMESITE,
                path: '/',
            });

            const { password_hash, ...user } = existingUser;
            return res.status(200).json({ user, token });
        }
    }
});

router.post("/logout", (req, res, next) => {
    const cookieName = process.env.ACCESS_TOKEN_COOKIE;

    res.clearCookie(cookieName, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAMESITE,
        path: '/',
    }).status(204).end();
})

export default router;