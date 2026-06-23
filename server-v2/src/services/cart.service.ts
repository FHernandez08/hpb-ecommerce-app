// Handles all the oerations regarding the cart table when interacting with the application.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, type UpdateCommandInput, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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