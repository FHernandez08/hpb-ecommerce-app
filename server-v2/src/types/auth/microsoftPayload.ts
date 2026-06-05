import * as z from "zod";

export const MicrosoftPayloadSchema = z.object({
    provider: z.string(),
    id: z.string(),
    displayName: z.string(),
    name: z.object({
        familyName: z.string(),
        givenName: z.string(),
    }),
    emails: z.array(z.object({
        value: z.string(),
        type: z.string(),
    })).optional(),
    photos: z.array(z.object({
        value: z.string().optional()
    })),
    _raw: z.string(),
    _json: z.object({
        id: z.string(),
        displayName: z.string(),
        givenName: z.string(),
        surname: z.string(),
        jobTitle: z.string().optional(),
        mail: z.string(),
        userPrincipalName: z.string(),
        businessPhones: z.array(z.string()),
        preferredLanguage: z.string().optional(),
        officeLocation: z.string().optional()
    }).passthrough(),
});

// Inferred Types
export type MicrosoftPayloadObject = z.infer<typeof MicrosoftPayloadSchema>