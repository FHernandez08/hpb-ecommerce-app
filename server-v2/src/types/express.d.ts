import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";

declare global {
    namespace Express {
        interface Request {
            user?: CognitoAccessTokenPayload;
        }
    }
}