// it ensures that the coupon is usable at the moment for the certain booking

import { pool } from "../db/db.js";

async function couponValidationLogic(code, subtotal_cents) {
    let trimmedCode;
    let discount;

    if (typeof code !== "string") {
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
            message: "Invalid input value for subtotal."
        };
    }
    else {
        if (subtotal_cents < 0) {
            return {
                valid: false,
                reason: "invalid_input",
                message: "Subtotal is negative."
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
    };
    
    const id = couponRow.rows[0]["id"];
    const is_active = couponRow.rows[0]["is_active"];
    const starts_at = couponRow.rows[0]["starts_at"];
    const ends_at = couponRow.rows[0]["ends_at"];
    const max_redemptions = couponRow.rows[0]["max_redemptions"];
    const redemptions_count = couponRow.rows[0]["redemptions_count"];
    const min_subtotal_cents = couponRow.rows[0]["min_subtotal_cents"];
    const type = couponRow.rows[0]["type"];
    const amount = couponRow.rows[0]["amount"];

    if (is_active !== true) {
        return {
            valid: false,
            reason: "inactive",
            message: "Coupon not activated."
        }
    };

    if (starts_at !== null && new Date() < starts_at) {
        return {
            valid: false,
            reason: "not_started",
            message: "Coupon has not been made available yet."
        }
    };

    if (ends_at !== null && new Date() > ends_at) {
        return {
            valid: false,
            reason: "expired",
            message: "Coupon has expired."
        }
    };

    if (max_redemptions !== null && redemptions_count >= max_redemptions) {
        return {
            valid: false,
            reason: "maxed_out",
            message: "Coupon has been fully redeemed."
        }
    };

    if (min_subtotal_cents !== null && subtotal_cents < min_subtotal_cents) {
        return {
            valid: false,
            reason: "min_subtotal_not_met",
            message: "Order subtotal does not meet coupon requirements."
        }
    }

    if (type === 'PERCENT') {
        if (!Number.isInteger(amount)) {
            return {
                valid: false,
                reason: "amount_input_wrong",
                message: "Percentage value incorrect."
            }
        }
        else {
            if (amount < 1 || amount > 100) {
                return {
                    valid: false,
                    reason: "amount_not_in_range",
                    message: "Amount value not in range."
                }
            }
            else {
                discount = Math.floor(subtotal_cents * amount / 100);
            }
        }
    }
    else if (type === 'FIXED') {
        if (!Number.isInteger(amount)) {
            return {
                valid: false,
                reason: "amount_input_wrong",
                message: "Fixed amount value incorrect."
            };
        }
        else {
            if (amount <= 0) {
                return {
                    valid: false,
                    reason: "amount_not_in_range",
                    message: "The amount value is not valid."
                }
            }
            else {
                discount = amount;
            }
        }
    }
    else {
        return {
            valid: false,
            reason: "server_error",
            message: "Coupon configuration error."
        }
    }

    if (!Number.isInteger(discount) || discount < 0) {
        return {
            valid: false,
            reason: "server_error",
            message: "Discount calculation error."
        }
    }

    const discount_cents = Math.min(discount, subtotal_cents);
    const total_cents = subtotal_cents - discount_cents;

    return {
        valid: true,
        coupon: { id, code: trimmedCode, type, amount, min_subtotal_cents },
        subtotal_cents,
        discount_cents,
        total_cents
    };
};

export default couponValidationLogic;