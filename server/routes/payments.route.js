// in index.js --> implement app.use("/api/payments", paymentsRouter)

import express from "express";
const router = express.Router();

// ROUTES //
// creates the PayPal session
router.post("/intent", (req, res) => {
    null;
});

// confirms the payment on the client-side - redirect page to successful payment
router.post("/confirm", (req, res) => {
    null;
});

// provides webhook (signed, idempotent)
router.post("/webhook", (req, res) => {
    null;
});

export default router;