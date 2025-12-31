// in index.js --> implement app.use("/api/admin", {adminOrdersRouter})

import express from "express";
const router = express.Router();

// admin's view of orders
router.get("/", async (req, res) => {
    null
});

// admin order detail for specific order
router.get("/:orderId", async (req, res) => {
    null
});

export default router;