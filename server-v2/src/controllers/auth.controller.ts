import { type Request, type Response } from "express";
import { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } from "@aws-sdk/client-cognito-identity-provider";
import type { InitiateAuthCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { validatedAWSSchema } from "../config/aws.config";

// Initializing the Cognito Client
const cognitoClient = new CognitoIdentityProviderClient({
    region: validatedAWSSchema.AWS_REGION
});

// Login Controller
export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Basic request validation
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required! "});
            return;
        }

        // Configure the authentication command parameters which are attached to the command.
        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: validatedAWSSchema.AWS_COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            },
        });

        // Send the command to AWS Cognito
        const response = await cognitoClient.send(command);

        // Handle Cognito Challenges
        if (response.ChallengeName) {
            res.status(200).json({
                message: 'Authentication challenge required',
                ChallengeName: response.ChallengeName,
                session: response.Session,
            });
            return;
        };

        // stripping the sensitive tokens out of the .json() body
        if (response.AuthenticationResult) {
            const { AccessToken, RefreshToken, ExpiresIn } = response.AuthenticationResult;

            // Drop the access token into a secure cookie vault
            res.cookie('accessToken', AccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            // Drop the refresh token into its own cookie vault
            res.cookie('refreshToken', RefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Send back a clean, token-free success response to the frontend
            res.status(200).json({
                message: 'Login successful!',
                expiresIn: ExpiresIn,
            });

            return;
        }

        
        res.status(500).json({ error: 'Unexpected response format from authentication server.' });

    } catch (error: any) {
        // Handling common Cognito exceptions
        console.error('Cognito login error:', error);

        if (error.name === 'NotAuthorizedException') {
            res.status(401).json({ error: 'Incorrect email or password.' });
            return;
        }
        if (error.name === 'UserNotConfirmedException') {
            res.status(403).json({ error: 'User email is registered but not confirmed.' });
            return;
        }
        if (error.name === 'UserNotFoundException') {
            res.status(404).json({ error: 'No user found with the provided email.' });
            return;
        }

        res.status(500).json({ error: error.message || 'Internal server error.' });
    }
};

// Refresh Controller
export const refreshController = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token is required!' });
        };

        const clientId = validatedAWSSchema.AWS_COGNITO_CLIENT_ID;
        if (!clientId) {
            throw new Error('COGNITO_CLIENT_ID environment variable is not set.');
        }

        const params: InitiateAuthCommandInput = {
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: clientId,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        };

        const command = new InitiateAuthCommand(params);
        const data = await cognitoClient.send(command);

        // data.AuthenticationResult with contain the new AccessToken and IdToken
        if (data.AuthenticationResult) {
            const { AccessToken } = data.AuthenticationResult;

            // Overwrite the old cookie with the brand-new rotated Access Token
            res.cookie('accessToken', AccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            return res.status(200).json({
                message: 'Token refreshed successfully!'
            });
        }
    } catch (error: any) {
        console.error('Error refreshing token:', error);
        return res.status(400).json({
            error: 'Failed to refresh token.',
            details: error.message,
        });
    }
};