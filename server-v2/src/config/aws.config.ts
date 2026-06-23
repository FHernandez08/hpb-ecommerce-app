import * as z from "zod";

const AWSSchema = z.object({
    AWS_REGION: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),
    AWS_COGNITO_USER_POOL_ID: z.string(),
    AWS_COGNITO_CLIENT_ID: z.string(),
    AWS_DYNAMODB_TABLE_NAME: z.string(),
    AWS_DYNAMODB_CART_TABLE_NAME: z.string(),
});

export const RemoteSecretsSchema = z.object({
    DB_USER: z.string(),
    DB_HOST: z.string(),
    DB_DATABASE: z.string(),
    DB_PASSWORD: z.string().regex(/^[A-Za-z]+#\d+$/),
    DB_PORT: z.coerce.number().int(),
    PAYPAL_CLIENT_ID: z.string(),
    PAYPAL_CLIENT_SECRET: z.string(),
    // PAYPAL_MODE: z.enum(['sandbox', 'live']), --> this line of code is to be uncommented when working on the payment routes and working with PayPal API
});

export const validatedAWSSchema = AWSSchema.parse(process.env);
export const validatedSecretsSchema = RemoteSecretsSchema.parse(process.env);

// Inferred Types
export type ParsedSchema = z.infer<typeof AWSSchema>
export type ParsedSecretsSchema = z.infer<typeof RemoteSecretsSchema>