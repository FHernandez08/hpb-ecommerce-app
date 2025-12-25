// in index.js --> app.use("/api/bookings", bookingsRouter)

import express from "express";
const router = express.Router();

// creates booking route that ties user to package/date, enforces ownership
router.post("/", (req, res) => {
    null;
});

// list the bookings tied to user - option to filter based on status/date
router.get("/me", (req, res) => {
    null;
});

// gets the booking if owner; admin is able to view all the bookings
// : = url parameter
router.get("/:bookingId", (req, res) => {
    null;
});

export default router;