import express, { type Request, type Response, type NextFunction } from "express";
import * as z from "zod";
import requestIp from "request-ip";
import { useragent } from "express-useragent";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { validatedAWSSchema } from "../config/aws.config";

const bareClient = new DynamoDBClient({ region: validatedAWSSchema.AWS_REGION });
const dynamoClient = DynamoDBDocumentClient.from(bareClient);

export async function auditLogger(req: Request, res: Response, next: NextFunction) {
    try {
        // 1. Identify the Actor
        const actor = req.user?.sub
        
        // 2. Identify the action and context
        const userPath = req.path;
        const ipAddress = requestIp.getClientIp(req) ?? req.ip;
        const userAgent = req.useragent?.browser || req.headers['user-agent'] || 'unknown';

        // 3. Clone and sanitize req.body
        const SENSITIVE_KEYS = ['password', 'confirm_password', 'password_confirmation', 'credit_card', 'ssn', 'token'];

        const sanitizePayload = (body: any): any => {

            // Defends the incoming paylaod so when confirming the user, it would return an empty value for token, which would trigger the authenticaion middleware to return a 401 unauthorized code.
            if (body === undefined || body === null) {
                return {};
            };

            const cloned = JSON.parse(JSON.stringify(body))

            const redact = (obj: any) => {
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
                            obj[key] = "[REDACTED]";
                        }
                        else if (typeof obj[key] === 'object' && obj[key] !== null) {
                            redact(obj[key]);
                        }
                    }
                }
            }

            redact(cloned);
            return cloned;
        }

        const sanitizedPayload = sanitizePayload(req.body);

        // 4. Asynchronously fire the database INSERT (fire-and-forget pattern)
        res.on('finish', () => {
            const auditItem = {
            TableName: validatedAWSSchema.AWS_DYNAMODB_TABLE_NAME,
            Item: {
                    id: crypto.randomUUID(),
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    actor_id: actor ?? "ANONYMOUS",
                    action: `${req.method}:${userPath}`,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        ip: ipAddress,
                        browser: userAgent
                    },
                    payload: sanitizedPayload
                }
            };

            // Fire the promise without awaiting it, letting Express proceed instantly
            dynamoClient.send(new PutCommand(auditItem)).catch((dbError) => {
                console.error("CRITICAL: Audit Telemetry failed to write:", dbError);
            });
        });

    } catch (error) {
        console.error("SYSTEM ERROR: Exception thrown inside auditLogger middleware:", error);
    }

    next();
}