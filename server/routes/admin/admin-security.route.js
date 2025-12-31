// in index.js --> implement app.use("/api/admin", {securityAdminRouter})

import express from "express";
const router = express.Router();

// security events list
router.get("/", async (req, res) => {
    null
});

// filter by type (authentication | authorization | integrity)
router.get("/:type", async (req, res) => {
    null
});

export default router;