import * as z from "zod";

export const CouponSchema = z.object({
    id: z.uuid(),
    code: z.string().nullable(),
    type: z.enum(["PERCENT", "FIXED"]).nullable(),
    amount_cents: z.number().int().nullable(),
    is_active: z.boolean().nullable().optional(),
    starts_at: z.coerce.date().nullable(),
    ends_at: z.coerce.date().nullable(),
    max_redemptions: z.number().int().nullable(),
    redemptions_count: z.number().int().nullable(),
    min_subtotal_cents: z.number().int().nullable(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional()
});

export type Coupon = z.infer<typeof CouponSchema>;