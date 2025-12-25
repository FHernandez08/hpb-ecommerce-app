// in index.js --> implement app.use("/api/admin", {paymentsAdminRouter})

import express from "express";
const router = express.Router();

// manual override of payment status (paid in full, pending, rejected)
router.post("/payments/manual", async (req, res) => {
    null
});

export default router;