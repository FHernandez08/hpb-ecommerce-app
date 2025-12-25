// in index.js --> implement app.use("/api/admin", {usersAdminRouter})

import express from "express";
const router = express.Router();

// list users
router.get("/users", async (req, res) => {
    null
});

// specific user details - admin view
router.get("/users/:userId", async (req, res) => {
    null
});

export default router;