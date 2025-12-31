import express from "express";

import getTokenFrom from "../middleware/getTokenFrom.js";
import verifyAccessToken from "../middleware/verifyAccessToken.js";
import attachUser from "../middleware/attachUser.js";
import { ensureAuth } from "../middleware/ensure.js";
import { updateUser } from "../db/userFunctions.js";

const router = express.Router();

// current user route - GET
router.get("/me", getTokenFrom, verifyAccessToken, attachUser, ensureAuth, (req, res, next) => {
    const user = req.user;
    return res.status(200).json({ user });
});

// update user's profile fields
router.put("/me", getTokenFrom, verifyAccessToken, attachUser, ensureAuth, async (req, res, next) => {
    try {
        const { firstName, lastName } = req.body;
        const updates = {};

        if (firstName !== undefined) {
            if (typeof firstName !== "string") {
                return res.status(400).json({ message: "firstName must be a string." });
            }

            const trimmedFirstName = firstName.trim();
            if (!trimmedFirstName) {
                return res.status(400).json({ message: "firstName cannot be empty." });
            }

            updates.first_name = trimmedFirstName;
        }

        if (lastName !== undefined) {
            if (typeof lastName !== "string") {
                return res.status(400).json({ message: "lastName must be a string." });
            }

            const trimmedLastName = lastName.trim();
            if (!trimmedLastName) {
                return res.status(400).json({ message: "lastName cannot be empty." });
            }

            updates.last_name = trimmedLastName;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Can't update the user's profile!" });
        }
        else {
            const currentUser = await updateUser(req.user.id, updates);

            if (!currentUser) {
                return res.status(404).json({ message: "User not found!" });
            }
            else {
                const { password_hash, ...safeUser } = currentUser;
                return res.status(200).json({ user: safeUser });
            }
        }
    }
    catch (err) {
        next(err);
    }
});

export default router;