import express from "express";
import bcrypt from "bcryptjs";
import { pool } from '../../db/db';

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields, please complete the login form!"})
        }

        const lowercasedEmail = email.toLowerCase();
        const saltRounds = 10;

        const checkResult = await pool.query("SELECT * FROM users WHERE email = $1",
            [lowercasedEmail]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: "The user already exists! Try logging in." });
        }
        else {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await pool.query(
              "INSERT INTO users (role, status, first_name, last_name, email, phone, password_hash) VALUES ('user', DEFAULT, $1, $2, $3, $4, $5)",
              [firstName, lastName, lowercasedEmail, phoneNumber, hashedPassword]
            );
            console.log(result);
            res.redirect("/");
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'Issue with the registration.' });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Missing required fields, please complete the login form!" })
        }

        const lowercasedEmail = email.toLowerCase();

        const checkEmail = await pool.query("SELECT * FROM users WHERE email = $1", 
            [lowercasedEmail]
        );

        if (checkEmail.rows.length === 1) {
            const hashedPassword = checkEmail.rows[0].password_hash;
            const currentStatus = checkEmail.rows[0].status;

            if (currentStatus === "active") {
                const isMatch = await bcrypt.compare(password, hashedPassword);

                if (isMatch) {
                    console.log("Successful Login!")
                    res.redirect("/");
                }
                else {
                    return res.status(401).json("The credentials were invalid. Try again!")
                }
            } else {
                return res.status(403).json({ message: "Forbidden access. Contact the website admin!"})
            }

        } else {
            return res.status(401).json({ message: "The email does not exist. Please try again!"})
        }

    }
    catch (err) {
        return res.status(500).json({ message: "Issue with logging in your account. Please try again later!"})
    }
});

router.post("/logout", async (req, res) => {
    // this route will be used for both login/register features
});


// need to add /auth/logout

// need to add /auth/refresh

// need to add /password/forgot

// need to add /password/reset



module.exports = router;