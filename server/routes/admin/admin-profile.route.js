// in index.js --> implement app.use("/api/admin", {profilesAdminRouter})

import express from "express";
const router = express.Router();

// admin self/profile
router.get("/", async (req, res) => {
    null
});

export default router;