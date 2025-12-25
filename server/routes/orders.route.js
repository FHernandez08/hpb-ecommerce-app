// this will be handling the ordering of the booths
// in index.js --> implement app.use("/api/orders", ordersRouter)

import express from "express";
const router = express.Router();

// create order from cart, make the status = pending
router.post("/", async (req, res) => {
    null
});

// list the orders
router.get("/", async (req, res) => {
    null
});

// gets one order, permission for owner or admin
router.get("/:orderId", async (req, res) => {
    null
});

export default router;