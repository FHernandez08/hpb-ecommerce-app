// in index.js --> implement app.use("/api/admin", {bookingsAdminRouter})

import express from "express";
const router = express.Router();

// bookings list - admin view
router.get("/bookings", async (req, res) => {
    null
});

// details for specific booking - admin view
router.get("/bookings/:bookingId", async (req, res) => {
    null
});

// admin updates booking fields/status
router.put("/bookings/:bookingId", async (req, res) => {
    null
});

// admin cancel/archives booking
router.delete("/bookings/:bookingId", async (req, res) => {
    null
});

export default router;