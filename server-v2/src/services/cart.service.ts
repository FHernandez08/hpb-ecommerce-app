// Handles all the oerations regarding the cart table when interacting with the application.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, type UpdateCommandInput, DeleteCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { validatedAWSSchema } from "../config/aws.config";

const baseClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(baseClient);

interface UpdateCartContent {
    price: number;
    quantity: number;
    details: string[];
}

export async function addItemToCart(userId: string, itemId: string, itemData: UpdateCartContent) {
    const params: UpdateCommandInput = {
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        Key: {
            PK: `USER#${userId}`,
            SK: `CART#ITEM#${itemId}`
        },
        UpdateExpression: "SET quantity = if_not_exists(quantity, :zero) + :inc, price = :price, details = :details",
        ExpressionAttributeValues: {
            ":inc": itemData.quantity,
            ":price": itemData.price,
            ":details": itemData.details,
            ":zero": 0,
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        const response = await docClient.send(new UpdateCommand(params));
        console.log(response);
        return response;
    }
    catch (err) {
        console.error("Error updating the cart...", err);
        throw err;
    }
};

export async function removeItemFromCart(userId: string, itemId: string) {
    const command = new DeleteCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        Key: {
            PK: `USER#${userId}`,
            SK: `CART#ITEM#${itemId}`,
        },
    });

    try {
        const response = await docClient.send(command);
        return response;
    }
    catch (err) {
        console.error("Error removing an item from the cart...", err);
        throw err;
    }
};

export async function getCartByUserId(userId: string) {
    const command = new QueryCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": `USER#${userId}`
        },
    });

    try {
        const response = await docClient.send(command);
        return response;
    }
    catch (err) {
        console.error("Error trying to get cart tied to the user...", err);
        throw err;
    }
};

export async function applyCouponToCart(userId: string, couponCode: string) {
    const currentTime = Math.floor(Date.now() / 1000);

    const command = new UpdateCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        Key: {
            PK: `COUPON#${couponCode}`,
            SK: 'METADATA'
        },
        ConditionExpression: "active = :is_active AND :currentTime BETWEEN starts_at and ends_at AND redemptions_count < max_redemptions",
        ExpressionAttributeValues: {
            ":is_active": true,
            ":currentTime": currentTime,
            ":one": 1
        },
        UpdateExpression: "SET redemptions_count = redemptions_count + :one",
    });

    const combinedCommand = new UpdateCommand({
            TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'CART#COUPON'
            },
            UpdateExpression: "SET couponCode = :code, isApplied = :applied",
            ExpressionAttributeValues: {
                ":code": couponCode,
                ":applied": true
            }
        });

    try {
        const response = await docClient.send(command);
        const combinedResponse = await docClient.send(combinedCommand);
        return { success: true }  
    }
    catch (err) {
        console.error("Error applying the coupon to the cart...", err);
        throw err;
    };
};

export async function clearCartService(userId: string) {
    const command = new QueryCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": `USER#${userId}`
        }
    });

    try {
        const queryResponse = await docClient.send(command);

        if (!queryResponse.Items || queryResponse.Items.length === 0) 
            return { success: true, message: "Cart already empty" };

        const deleteRequests = queryResponse.Items.map(item => ({
            DeleteRequest: {
                Key: {
                    PK: item.PK,
                    SK: item.SK
                }
            }
        }));

        const batchCommand = new BatchWriteCommand({
            RequestItems: {
                [validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME]: deleteRequests
            }
        });

        await docClient.send(batchCommand);
        return { success: true };
    }
    catch (err) {
        console.error("Could not erase the entire cart... please try again later!", err);
        throw err;
    }
}

export async function updateItemQuantityService(userId: string, itemId: string, targetQuantity: number) {
    const command = new UpdateCommand({
        TableName: validatedAWSSchema.AWS_DYNAMODB_CART_TABLE_NAME,
        Key: {
            PK: 'USER#' + userId,
            SK: 'CART#ITEM#' +itemId
        },
        UpdateExpression: "SET quantity = :qty",
        ExpressionAttributeValues: {
            ":qty": targetQuantity
        }
    });

    try {
        const response = await docClient.send(command);
        console.log(response);
        return response;
    } catch (err) {
        console.error("Error updating the quantity of the item...", err);
        throw err;
    }
};