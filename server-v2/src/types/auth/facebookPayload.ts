import * as z from "zod";

export const FacebookPayloadSchema = z.object({
    provider: z.string(),
    id: z.string(),
    displayName: z.string(),
    name: z.object({
        familyName: z.string(),
        givenName: z.string(),
        middleName: z.string().optional(),
    }),
    gender: z.string().optional(),
    emails: z.array(z.object({
        value: z.string(),
    })).optional(),
    photos: z.array(z.object({
        value: z.string().optional(),
    })),
    _raw: z.string(),
    _json: z.object({
        id: z.string(),
        name: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
    }).passthrough()
});

// Inferred Types
export type FacebookPayloadObject = z.infer<typeof FacebookPayloadSchema>