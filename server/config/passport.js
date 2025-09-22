import passport from "passport";
import passportFacebook from "passport-facebook";
import passportGoogle from "passport-google-oauth20";
import passportMicrosoft from "passport-microsoft";

import { getUserByEmail, getUserByProvider, getUserById, createUser, linkOAuthIdentity } from "../models/User.js";
import { link } from "fs";

const facebookStrategy = passportFacebook.Strategy;
const googleStrategy = passportGoogle.Strategy;
const microsoftStrategy = passportMicrosoft.Strategy;

// Strategies //
// Google Strategy
passport.use(new googleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const provider = "google";
      const providerUserId = String(profile?.id ?? "").trim();
      if (!providerUserId) return cb(null, false);

      // Step 1: identity-first
      const providerUser = await getUserByProvider(provider, providerUserId);
      if (providerUser) return cb(null, providerUser);

      // Step 2: email fallback
      const rawEmail = profile?.emails?.[0]?.value;
      const emailLower =
        typeof rawEmail === "string" && rawEmail.trim()
          ? rawEmail.trim().toLowerCase()
          : null;

      if (emailLower) {
        const emailUser = await getUserByEmail(emailLower);
        if (emailUser) {
          await linkOAuthIdentity(emailUser.id, {
            provider,
            providerUserId,
            email: emailLower,
          });
          return cb(null, emailUser);
        }
      }

      // Step 3: create + link
      const firstName =
        typeof profile?.name?.givenName === "string" && profile.name.givenName.trim()
          ? profile.name.givenName.trim()
          : null;

      const lastName =
        typeof profile?.name?.familyName === "string" && profile.name.familyName.trim()
          ? profile.name.familyName.trim()
          : null;

      const newUser = await createUser({
        email: emailLower,
        firstName,
        lastName,
      });

      await linkOAuthIdentity(newUser.id, {
        provider,
        providerUserId,
        email: emailLower,
      });

      return cb(null, newUser);
    } catch (err) {
      return cb(err);
    }
  }
));

// Microsoft Strategy
passport.use(new microsoftStrategy(
    {
        clientID: process.env.MICROSOFT_SECRET_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
        scope: ['user.read']
    },
    async function (accessToken, refreshToken, profile, done) {

    }
))


// Facebook Strategy
passport.use(new facebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, cb) {

    }
))


// Serialize + Deserialize //
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