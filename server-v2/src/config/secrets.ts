import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { validatedAWSSchema, RemoteSecretsSchema, type ParsedSecretsSchema } from "./aws.config";

class awsSecretsUtility {
    private readonly secretsClient: SecretsManagerClient;
    public secrets!: ParsedSecretsSchema;
    
    constructor() {
        this.secretsClient = new SecretsManagerClient({ region: validatedAWSSchema.AWS_REGION });
    }

    async initializeSecrets() {
        const input = {
            SecretId: "production/v2/payment-db-secrets"
        }

        const command = new GetSecretValueCommand(input);
        const response = await this.secretsClient.send(command);

        const parsedResponse = JSON.parse(response.SecretString!);
        const validatedSecrets = RemoteSecretsSchema.parse(parsedResponse);

        this.secrets = validatedSecrets;
    }
}

export const secretsConfig = new awsSecretsUtility();