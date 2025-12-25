// it implements like a feature where we can give privacy to the user by asking for consent to post their events pictures to the public
// in index.js --> implement app.use("/api/consents", consentsRouter)

import express from "express";
const router = express.Router();

// submits consent tied to booking
router.post("/", async (req, res) => {
    null
});

// checks consent status by booking
router.get("/:bookingId", async(req, res) => {
    null
});

export default router;