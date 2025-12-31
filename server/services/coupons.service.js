// it ensures that the coupon is usable at the moment for the certain booking

import { pool } from "../db/db.js";

async function couponValidationLogic(code, subtotal_cents) {
    let trimmedCode;

    if (typeof code === "string") {
        return {
            valid: false,
            reason: 'invalid_input',
            message: "There's no discount code."
        };
    }
    else {
        trimmedCode = code.trim().toUpperCase();
        if (trimmedCode.length === 0) {
            return {
                valid: false,
                reason: "invalid_input",
                message: "There's no discount code."
            };
        };
    };

    if (!Number.isInteger(subtotal_cents)) {
        return {
            valid: false,
            reason: "invalid_input",
            message: "There's no discount code."
        };
    }
    else {
        if (subtotal_cents < 0) {
            return {
                valid: false,
                reason: "invalid_input",
                message: "There's no discount code."
            };
        };
    };

    const couponRow = await pool.query(
        "SELECT id, code, type, is_active, starts_at, ends_at, max_redemptions, redemptions_count, min_subtotal_cents, amount FROM coupons WHERE code = $1", [trimmedCode]
    );

    if (couponRow.rowCount === 0) {
        return {
            valid: false,
            reason: "not_found",
            message: "Invalid coupon code."
        }
    }
    else {
        const is_active = couponRow.rows[0]["is_active"];
        if (is_active !== true) {
            return {
                valid: false,
                reason: "inactive",
                message: "Coupon not activated."
            }
        }
        else {
            const starts_at = couponRow.rows[0]["starts_at"];
            if (starts_at !== null && new Date() < starts_at) {
                return {
                    valid: false,
                    reason: "not_started",
                    message: "Coupon has not been made available yet."
                }
            }
            else {
                const ends_at = couponRow.rows[0]["ends_at"];
                if (ends_at !== null && new Date() > ends_at) {
                    return {
                        valid: false,
                        reason: "expired",
                        message: "Coupon has expired."
                    }
                }
                else {
                    const max_redemptions = couponRow.rows[0]["max_redemptions"];
                    const redemptions_count = couponRow.rows[0]["redemptions_count"];
                    if (max_redemptions !== null && redemptions_count >= max_redemptions) {
                        return {
                            valid: false,
                            reason: "maxed_out",
                            message: "Coupon has been fully redeemed."
                        }
                    }
                    else {
                        const min_subtotal_cents = couponRow.rows[0]["min_subtotal_cents"];
                        if (min_subtotal_cents !== null && subtotal_cents < min_subtotal_cents) {
                            return {
                                valid: false,
                                reason: "min_subtotal_not_met",
                                message: "Order subtotal does not meet coupon requirements."
                            }
                        }
                        else {
                            // compute discount + total
                            const type = couponRow.rows[0]["type"];
                            
                        }
                    }
                }
            }
        }
    }

};

export default couponValidationLogic;