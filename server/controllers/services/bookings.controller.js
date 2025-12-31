import { pool } from "../../db/db.js";

import bookingDurationLogic from "../../services/bookingDuration.service.js";
import bookingCalcLogic from "../../services/bookingPricing.service.js";
import bookingSnapshotLogic from "../../services/bookingSnapshot.service.js";

async function createBooking(req, res) {
    const client = await pool.connect();
    try {
        // Grab the inputs
        const { product_id, event_start_at, duration_minutes, notes, timezone, city, state, zip } = req.body;

        const user_id = req.user.sub;

        // Implementing the logic services
        const durationResult = bookingDurationLogic(event_start_at, duration_minutes);
        const validatedMinutes = durationResult.duration_minutes;

        const pricingPayload = bookingCalcLogic(product_id, validatedMinutes);

        // DB Transaction
        await client.query("BEGIN");

        const bookingInsert = await client.query("INSERT INTO bookings (user_id, product_id, event_start_at, notes, duration_minutes, timezone, city, state, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, status, event_start_at, duration_minutes, product_id, created_at", [
            user_id, product_id, event_start_at, notes, validatedMinutes, timezone, city, state, zip
        ]);

        const bookingRow = bookingInsert.rows[0];

        const bookingId = bookingInsert.rows[0].id;

        const snapshotRow = await bookingSnapshotLogic(client, bookingId, pricingPayload);

        await client.query("COMMIT");
        res.status(201).json({ booking: bookingRow, snapshot: snapshotRow });
        
    }
    catch (err) {
        await client.query("ROLLBACK");
        res.status(400).send("Bad Request!");
    }
    finally {
        client.release();
    }
};

async function getMyBookings(req, res) {
    const userId = req.user.sub;

    const { rows } = await pool.query(
        "SELECT b.id, b.user_id, b.product_id, b.event_start_at, b.duration_minutes, b.status, b.notes, b.timezone, b.city, b.state, b.zip, b.created_at, s.booking_id, s.is_quote_pending, s.total, s.currency, s.line_items, s.created_at AS snapshot_created_at FROM bookings AS b LEFT JOIN booking_pricing_snapshots AS s ON s.booking_id = b.id WHERE b.user_id = $1 ORDER BY b.created_at DESC", [userId]
    );

    res.status(200).json({ bookings: rows });
}

async function getBookingById(req, res) {
    const userId = req.user.sub;
    const bookingId = req.params.bookingId;

    const { rows } = await pool.query(
        "SELECT b.id, b.user_id, b.product_id, b.event_start_at, b.duration_minutes, b.status, b.notes, b.timezone, b.city, b.state, b.zip, b.created_at, s.booking_id, s.is_quote_pending, s.total, s.currency, s.line_items, s.created_at AS snapshot_created_at FROM bookings AS b LEFT JOIN booking_pricing_snapshots AS s ON s.booking_id = b.id WHERE b.id = $1 AND b.user_id = $2", [bookingId, userId]
    );

    if (rows.length === 0) {
        res.status(404).json({ message: "Booking not found" });
    }
    else {
        res.status(200).json({ booking: rows[0] });
    }
};

export { createBooking, getMyBookings, getBookingById };