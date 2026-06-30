import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { validatedAWSSchema } from "./aws.config";

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function seedCoupon() {
    const command = new PutCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        Item: {
            PK: "COUPON#MASTERSALE2026",
            SK: "METADATA",
            type: "FIXED",
            amount_cents: 2000,
            is_active: true,
            max_redemptions: 500,
            redemptions_count: 0,
            starts_at: 1770000000,
            ends_at: 1850000000
        }
    });

    await docClient.send(command);
    console.log("Master coupon seeded!");
};

seedCoupon();