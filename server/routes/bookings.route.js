// in index.js --> app.use("/api/bookings", bookingsRouter)

import validateData from "../middleware/validation";
import { ensureAuth } from "../middleware/ensure";

import express from "express";
import { createBooking, getMyBookings, getBookingById } from "../controllers/services/bookings.controller";
const router = express.Router();

// creates booking route that ties user to package/date, enforces ownership
router.post("/", ensureAuth, createBooking);

// list the bookings tied to user - option to filter based on status/date
router.get("/me", ensureAuth, getMyBookings);

// gets the booking if owner; admin is able to view all the bookings
// : = url parameter
router.get("/:bookingId", ensureAuth, getBookingById);

export default router;