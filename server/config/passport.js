import passport from "passport";
import passportFacebook from "passport-facebook";
import passportGoogle from "passport-google-oauth20";
import passportMicrosoft from "passport-microsoft";

import { getUserByEmail, getUserByProvider, getUserById } from "../models/User.js";

const facebookStrategy = passportFacebook.Strategy;
const googleStrategy = passportGoogle.Strategy;
const microsoftStrategy = passportMicrosoft.Strategy;

passport.serializeUser(function (user, cb) {
    cb(null, user.id)
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await getUserById(id);

        if (!user) return cb(null, false);
        return cb(null, user);
    }

    catch (err) {
        return cb(err);
    }
});