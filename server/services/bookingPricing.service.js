// base booking pricing calculation logic
// inputs: product_id, duration_minutes [increment=60, min=60, max=600]

function bookingCalcLogic(product_id, duration_minutes) {
    const tier_map = {
        60: 350.00,
        120: 425.00,
        180: 500.00,
        240: 575.00
    };

    const hours = duration_minutes / 60;

    const currency = "USD";
    const PRICING_VERSION = "v1-2025-12-25";

    if (duration_minutes <= 240 && tier_map[duration_minutes] === undefined) {
        throw new Error("Invalid standard package duration.");
    }
    else {
        // standard package - returns a priced snapshot
        if (duration_minutes <= 240) {
            const baseItem = {
                type: "base",
                label: `Booking package - ${hours} hour(s)`,
                quantity: 1,
                unit_price: tier_map[duration_minutes],
                amount: tier_map[duration_minutes],
                meta: {
                    tier_minutes: duration_minutes,
                    requested_minutes: duration_minutes
                }
            };

            const standardSnapShot = {
                currency: currency,
                pricing_version: PRICING_VERSION,
                duration_minutes: duration_minutes,
                is_quote_pending: false,
                line_items: [baseItem],
                subtotal: tier_map[duration_minutes],
                discount_total: 0,
                tax_rate: 0,
                tax_total: 0,
                total: tier_map[duration_minutes]
            };

            return standardSnapShot;
        }
        // custom duration - returns a quote-pending snapshot
        else {
            const quoteItem = {
                type: "quote",
                label: "Custom duration - quote pending",
                quantity: 1,
                unit_price: 0,
                amount: 0,
                meta: {
                    requested_minutes: duration_minutes,
                    note: "Exceeds standard packages"
                }
            };

            const customSnapshot = {
                currency: currency,
                pricing_version: PRICING_VERSION,
                duration_minutes: duration_minutes,
                is_quote_pending: true,
                line_items: [quoteItem],
                subtotal: 0,
                discount_total: 0,
                tax_rate: 0,
                tax_total: 0,
                total: 0
            };

            return customSnapshot;
        }
    }
};

export default bookingCalcLogic;