import * as z from "zod";
import { AddOnSchema } from "./addon";

const LineItemMetaSchema = z.object({
    tier_minutes: z.number(),
    requested_minutes: z.number()
});

const LineItemSchema = z.object({
    meta: LineItemMetaSchema,
    type: z.string(),
    label: z.string(),
    amount: z.number().int(),
    quantity: z.number().int(),
    unit_price: z.number().int()
})

const BookingAddOnSchema = z.object({
    booking_id: z.uuid(),
    add_on_id: z.uuid(),
    created_at: z.coerce.date().optional()
});

const BookingPricingSnapshotSchema = z.object({
    booking_id: z.uuid(),
    currency: z.string().optional(),
    pricing_version: z.string(),
    duration_minutes: z.number(),
    line_items: z.array(LineItemSchema),
    subtotal: z.number().int(),
    discount_total: z.number().int().optional(),
    tax_rate: z.number().int().optional(),
    tax_total: z.number().int().optional(),
    total: z.number().int(),
    created_at: z.coerce.date().optional(),
    is_quote_pending: z.boolean().optional()
});

const BookingSchema = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    product_id: z.uuid(),
    event_start_at: z.coerce.date(),
    status: z.enum(["requested", "confirmed", "cancelled", "completed"]).optional(),
    notes: z.string().nullable(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
    duration_minutes: z.number(),
    timezone: z.string().optional(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    zip: z.string().nullable(),
    snapshot_id: z.uuid().nullable(),
    subtotal_cents: z.number().int().optional(),
    discount_cents: z.number().int().optional(),
    total_cents: z.number().int().optional(),
    currency: z.string().nullable().optional()
});

export const BookingDetailedSchema = BookingSchema.extend({
    add_ons: z.array(AddOnSchema),
    pricing: BookingPricingSnapshotSchema.nullable()
})

// backend export type
export type BookingAddOn = z.infer<typeof BookingAddOnSchema>;
export type BookingPricingSnapshot = z.infer<typeof BookingPricingSnapshotSchema>;
export type Booking = z.infer<typeof BookingSchema>;

// frontend export type
export type BookingDetailed = z.infer<typeof BookingDetailedSchema>;