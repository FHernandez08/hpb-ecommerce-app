import * as z from "zod";

const AWSSchema = z.object({
    AWS_REGION: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),
    AWS_COGNITO_USER_POOL_ID: z.string(),
    AWS_COGNITO_CLIENT_ID: z.string(),
});

export const validatedAWSSchema = AWSSchema.parse(process.env);

// Inferred Types
export type ParsedSchema = z.infer<typeof AWSSchema>