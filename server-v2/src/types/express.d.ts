import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: CognitoAccessTokenPayload;
        }
    }
}

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
            files?: Multer.File[];
        }
    }
}