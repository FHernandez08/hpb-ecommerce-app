import * as z from "zod";

export const GooglePayloadSchema = z.object({
    provider: z.string(),
    id: z.string(),
    displayName: z.string(),
    name: z.object({
        familyName: z.string(),
        givenName: z.string(),
    }),
    emails: z.array(z.object({
        value: z.string(),
        verified: z.boolean(),
    })),
    photos: z.array(z.object({
        value: z.string(),
    })),
    _raw: z.string(),
    _json: z.object({
        sub: z.string(),
        name: z.string(),
        given_name: z.string(),
        family_name: z.string(),
        picture: z.string().optional(),
        email: z.email().trim(),
        email_verified: z.boolean(),
        locale: z.string()
    }).passthrough(),
});

// Inferred Types
export type GoogleProviderObject = z.infer<typeof GooglePayloadSchema>