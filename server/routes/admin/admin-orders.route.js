// in index.js --> implement app.use("/api/admin", {adminOrdersRouter})

import express from "express";
const router = express.Router();

// admin's view of orders
router.get("/orders", async (req, res) => {
    null
});

// admin order detail for specific order
router.get("/orders:/orderId", async (req, res) => {
    null
});

export default router;