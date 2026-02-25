import * as z from "zod";

export const AddOnSchema = z.object({
    id: z.uuid(),
    code: z.string().min(4),
    name: z.string(),
    description: z.string(),
    price_cents: z.number().min(0),
    is_active: z.boolean(),
    sort_order: z.number().min(0),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date()
});

export type AddOn = z.infer<typeof AddOnSchema>;