const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
    }
    catch (err) {

    }
});

router.post("/login", async (req, res) => {

});

module.exports = router;