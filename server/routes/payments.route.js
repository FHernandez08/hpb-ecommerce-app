// in index.js --> implement app.use("/api/payments", paymentsRouter)

import express from "express";
import { ensureAuth } from "../middleware/ensure.js";
import { pool } from "../db/db.js";
import crypto from "crypto";
import { getPaypalAccessToken } from "../services/paypal.service.js";

const router = express.Router();

// function to generate idempotency key
function generateIdempotencyKey() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
}

// ROUTES //
// creates the PayPal session
router.post("/paypal/create-order", ensureAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;

        let paymentStatus;

        if (typeof bookingId !== "string" || bookingId.trim().length === 0) {
            return res.status(400).send("Invalid input!");
        }

        const currentBooking = await pool.query(
            "SELECT id, user_id, status, total_cents, currency FROM bookings WHERE id = $1", [bookingId]
        );

        // ownership check - ensure that the booking belongs to the correct usser
        if (currentBooking.rowCount === 0) {
            return res.status(404).send("Booking not found!");
        }

        const currBookingUserId = currentBooking.rows[0]["user_id"];
        if (currBookingUserId !== req.user?.sub) {
            return res.status(403).send("Access denied!")
        };

        // booking status check - it can ONLY be requested, everything else is denied
        const currBookingStatus = currentBooking.rows[0]["status"];
        if (currBookingStatus !== "requested") {
            return res.status(409).send("Booking is not payable.")
        };

        // amount sanity check - ensure that the amount for the booking is greater than 0
        const currBookingTotalCents = currentBooking.rows[0]["total_cents"];
        const total = Number(currBookingTotalCents)
        if (!Number.isInteger(total) || total <= 0) {
            return res.status(409).send("Invalid total for the booking.")
        }

        // Duplicate / in-progress payment guard
        const paymentRow = await pool.query(
            `SELECT status FROM payments 
            WHERE booking_id = $1 
            AND status IN ('captured', 'created', 'requires_capture') 
            ORDER BY created_at DESC 
            LIMIT 1`, [bookingId]
        )

        if (paymentRow.rowCount > 0) {
            paymentStatus = paymentRow.rows[0]["status"];

            if (paymentStatus === "captured") {
            return res.status(409).send("The booking is already paid.")
        }

            return res.status(409).send("A payment is already in progress for this booking.")
        }

        // create PayPal order and insert payments row (status = created)
        const idempotencyKey = generateIdempotencyKey();
        const currBookingCurrency = currentBooking.rows[0]["currency"];

        const amount_value = String((total / 100).toFixed(2));
        const currency_code = currBookingCurrency || "USD";
        const return_url = "http://localhost:5173/dashboard";
        const cancel_url = "http://localhost:5173/dashboard";

        const paypalOrderPayload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: bookingId,
                    amount: {
                        currency_code: currency_code,
                        value: amount_value
                    },
                }
            ],
            application_context: { 
                return_url, 
                cancel_url 
            }
        };

        const accessToken = await getPaypalAccessToken();
        const resp = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "PayPal-Request-Id": idempotencyKey
            },
            body: JSON.stringify(paypalOrderPayload)
        });

        const data = await resp.json();

        if (!resp.ok) {
            return res.status(502).json({ message: "PayPal create order failed", details: data });
        }

        const paypalOrderId = data.id;
        const approvalUrl = data.links?.find(l => l.rel === "approve")?.href;

        if (!paypalOrderId || !approvalUrl) {
            return res.status(502).json({ message: "PayPal response missing id/approve link", details: data });
        }

        const inserted = await pool.query(
            `INSERT INTO payments (
                booking_id,
                user_id,
                provider,
                provider_order_id,
                status,
                status_reason,
                subtotal_cents,
                discount_cents,
                tax_cents,
                total_cents,
                provider_total_cents,
                idempotency_key,
                attempt_no,
                raw_provider_create
            )
            VALUES ($1, 'paypal', $2, 'created', NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING
                id, booking_id, provider, provider_order_id, status, currency, subtotal_cents, discount_cents,
                tax_cents, total_cents, idempotency_key, attempt_no, created_at`,
                [
                    bookingId, paypalOrderId, currency_code, total, 0, 0, total, total, idempotencyKey, 1, data
                ]
        );

        const payment = inserted.rows[0];

        return res.status(201).json({ payment, approvalUrl });
    }
    catch (err) {
        console.error("create-order error:", err);
        return res.status(500).json({ message: "500 Internal Server Error" });
    }
});

// confirms the payment on the client-side - redirect page to successful payment
router.post("/paypal/capture", ensureAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (typeof bookingId !== "string" || bookingId.trim().length === 0) {
            return res.status(400).send("Invalid input!");
        };

        const bookingIdTrimmed = bookingId.trim();

        const currBooking = await pool.query(
            `SELECT id, user_id, status, total_cents, currency FROM bookings WHERE id = $1`, [bookingIdTrimmed]
        );

        // if the query returns no rows = no booking exists
        if (currBooking.rowCount === 0) {
            return res.status(404).send("Booking not found!");
        }

        // ownership check - can only be coming from the actual user
        const currBookingUserId = currBooking.rows[0]["user_id"];
        if (currBookingUserId !== req.user.sub) {
            return res.status(403).send("Access denied!");
        }

        // booking status check - it can ONLY be requested, everything else is denied
        const currBookingStatus = currBooking.rows[0]["status"];
        if (currBookingStatus !== "requested") {
            return res.status(409).send("Booking is not payable.")
        };

        // amount sanity check - ensure that the amount for the booking is greater than 0
        const currBookingTotalCents = currBooking.rows[0]["total_cents"];
        const total = Number(currBookingTotalCents)
        if (!Number.isInteger(total) || total <= 0) {
            return res.status(409).send("Invalid total for the booking.")
        }

        // find the payment row
        const paymentRow = await pool.query(
            `SELECT id, provider_order_id, status, total_cents, currency FROM payments WHERE booking_id = $1
            AND provider = 'paypal'
            AND status IN ('created', 'requires_capture')
            ORDER BY created_at DESC
            LIMIT 1`, [bookingIdTrimmed]
        );

        if (paymentRow.rowCount === 0) {
            return res.status(409).send("No payment available to capture.");
        };

        const payment = paymentRow.rows[0];
        const paymentId = payment.id;
        const providerOrderId = payment.provider_order_id;

        if (!providerOrderId) {
            return res.status(500).send("Payment record missing provider order id.");
        }

        // call PayPal "Capture Order"
        const accessToken = await getPaypalAccessToken();
        const idempotencyKey = generateIdempotencyKey();

        const resp = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${providerOrderId}/capture`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "PayPal-Request-Id": idempotencyKey,
            },
            body: "",
        });

        const data = await resp.json();
        if (!resp.ok) {
            return res.status(502).json({ message: "PayPal capture failed!", details: data });
        }

        // Update the Payments + Bookings table
        const paypalStatus = data?.status;
        let nextStatus;

        if (paypalStatus === "COMPLETED") nextStatus = "captured";
        else if (paypalStatus === "PENDING") nextStatus = "requires_capture";
        else nextStatus = "failed";

        const statusReason = 
            nextStatus === "failed"
            ? `paypal_status:${paypalStatus || "unknown"}`
            : null;

        const capturedAt = nextStatus === "captured" ? new Date() : null;

        const providerCaptureId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

        const payerEmail = data?.payer?.email_address || null;
        const payerId = data?.payer?.payer_id || null;

        const updatedPayment = await pool.query(
        `
        UPDATE payments
        SET
            status = $1,
            status_reason = $2,
            provider_capture_id = $3,
            payer_email = $4,
            payer_id = $5,
            raw_provider_capture = $6,
            updated_at = NOW(),
            captured_at = COALESCE($7, captured_at)
        WHERE
            id = $8
            AND booking_id = $9
            AND provider = 'paypal'
            AND status IN ('created', 'requires_capture')
        RETURNING
            id, booking_id, provider, provider_order_id, provider_capture_id,
            status, status_reason, currency,
            subtotal_cents, discount_cents, tax_cents, total_cents,
            created_at, updated_at, captured_at
        `,
        [
            nextStatus,
            statusReason,
            providerCaptureId,
            payerEmail,
            payerId,
            data,         
            capturedAt,    
            paymentId,
            bookingIdTrimmed,
        ]
        );

        if (updatedPayment.rowCount === 0) {
        return res.status(409).send("Payment already processed or not capturable.");
        }

        let updatedBooking = null;

        if (nextStatus === "captured") {
        const bookingUpdate = await pool.query(
            `
            UPDATE bookings
            SET status = 'completed', updated_at = NOW()
            WHERE id = $1 AND status = 'requested'
            RETURNING id, status, updated_at
            `,
            [bookingIdTrimmed]
        );

        if (bookingUpdate.rowCount === 0) {
            return res.status(409).json({
            message: "Payment captured but booking not in payable state.",
            payment: updatedPayment.rows[0],
            });
        }

        updatedBooking = bookingUpdate.rows[0];
        }

        // Route response
        return res.status(200).json({
            payment: updatedPayment.rows[0],
            booking: updatedBooking,
        });
    }
    catch (err) {
        console.error("capture error", err);
        return res.status(500).json({ message: "500 Internal Server Error" });
    }
});

// provides webhook (signed, idempotent)
router.post("/paypal/webhook", async (req, res) => {
    null;
});

export default router;