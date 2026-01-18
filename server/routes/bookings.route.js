// in index.js --> app.use("/api/bookings", bookingsRouter)

import validateData from "../middleware/validation.js";
import { ensureAuth } from "../middleware/ensure.js";

import express from "express";
import { createBooking, getMyBookings, getBookingById } from "../controllers/services/bookings.controller.js";
import getTokenFrom from "../middleware/getTokenFrom.js";
import authenticateToken from "../middleware/verifyAccessToken.js";
import attachUser from "../middleware/attachUser.js";
const router = express.Router();

// creates booking route that ties user to package/date, enforces ownership
router.post("/", getTokenFrom, authenticateToken, attachUser, ensureAuth, createBooking);

// list the bookings tied to user - option to filter based on status/date
router.get("/me", getTokenFrom, authenticateToken, attachUser, ensureAuth, getMyBookings);

// gets the booking if owner; admin is able to view all the bookings
// : = url parameter
router.get("/:bookingId", getTokenFrom, authenticateToken, attachUser, ensureAuth, getBookingById);

export default router;