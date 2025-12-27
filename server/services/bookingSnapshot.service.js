// freeze snapshot

async function bookingSnapshotLogic(client, booking_id, pricingPayload) {
    if (!booking_id) {
        throw new Error("booking_id is required to create the snapshot!");
    }
    else {
        const { currency, pricing_version, duration_minutes, is_quote_pending, line_items, subtotal, discount_total, tax_rate, tax_total, total } = pricingPayload;

        const patchedLineItems = JSON.stringify(line_items);

        const { rows } = await client.query(
            "INSERT INTO booking_pricing_snapshots (booking_id, currency, pricing_version, duration_minutes, line_items, subtotal, discount_total, tax_rate, tax_total, total, is_quote_pending) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, booking_id, is_quote_pending, total, line_items, created_at",
            [
                booking_id,
                currency,
                pricing_version,
                duration_minutes,
                patchedLineItems,
                subtotal,
                discount_total,
                tax_rate,
                tax_total,
                total,
                is_quote_pending
            ]
        );

        return rows[0];
    }
}

export default bookingSnapshotLogic;