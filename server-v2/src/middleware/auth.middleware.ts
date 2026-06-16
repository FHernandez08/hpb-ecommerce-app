import { CognitoJwtVerifier } from "aws-jwt-verify";
import { validatedAWSSchema } from "../config/aws.config";
import { type Request, type Response, type NextFunction } from "express";

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: validatedAWSSchema.AWS_COGNITO_USER_POOL_ID,
    clientId: validatedAWSSchema.AWS_COGNITO_CLIENT_ID,
    tokenUse: "access",
});

export const verifyCognitoToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access token missing or invalid format." })
        }

        const token = authHeader.substring(7);

        // Verifies the token with the CognitoJwtVerifier instance created
        const payload = await jwtVerifier.verify(token);

        // Attaches the user's decoded information
        req.user = payload;
        next();
    } catch (err) {
        console.error("Token verificaiton failed", err);
        return res.status(401).json( { error: "Unauthorized access!" });
    }
};
