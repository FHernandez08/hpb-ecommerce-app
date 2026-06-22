import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export class HPBV2SpineDevStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // cognito user pool
    const adminUserPool = new cognito.UserPool(this, 'HpbAdminUserPool', {
      userPoolName: 'hpb-admin-dev',
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: false,
      autoVerify: {
        email: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // admin UI app client
    const adminUserPoolClient = adminUserPool.addClient('adminAppClient', {
      
    })

    /* Tables */
    // "SecurityAudit" Table
    const auditTable = new dynamodb.Table(this, 'SecurityAuditTable', {
      tableName: 'SecurityAudit',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // -------------------------------------------------------------------------------------------------------------------------//

    // lambda function for the HTTP API handler
    const hpbHttpApiLambda = new lambda.Function(this, 'LambdaHandler', {
      functionName: 'hpbWebAppApiFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../server-v2/src/lambda')),
      handler: 'handler.handler',
      environment: {
        STAGE: 'dev',
        AWS_DYNAMODB_TABLE_NAME: auditTable.tableName,
      }
    });

    // Granting the IAM permissions to write records to DynamoDB
    auditTable.grantReadWriteData(hpbHttpApiLambda);

    // Lambda integration
    const lambdaIntegration = new HttpLambdaIntegration('LambdaIntegration', hpbHttpApiLambda);

    // HTTP API created
    const hpbAdminHttpApi = new apigwv2.HttpApi(this, 'HPBAdminHttpApi', {
      apiName: 'HPBWebAdminHttpApi',
    });


    /* API Routes */
    // GET /health route
    hpbAdminHttpApi.addRoutes({
      path: '/health',
      methods: [apigwv2.HttpMethod.GET],
      integration: lambdaIntegration
    });

    // Proxy route to catch all /api/v2/users endpoints and pass them to Express
    hpbAdminHttpApi.addRoutes({
      path: '/api/v2/users/{proxy+}',
      methods: [
        apigwv2.HttpMethod.GET,
        apigwv2.HttpMethod.POST,
        apigwv2.HttpMethod.PUT,
        apigwv2.HttpMethod.DELETE
      ],
      integration: lambdaIntegration
    });

    // -------------------------------------------------------------------------------------------------------------------------//
    /* stages */
    hpbAdminHttpApi.addStage('DevStage', {
      stageName: 'dev',
      autoDeploy: true,
    })
    
    // -------------------------------------------------------------------------------------------------------------------------//
    /* Outputs */
    // Output for health endpoint
    new cdk.CfnOutput(this, 'apiGatewayBaseUrl', {
      value: hpbAdminHttpApi.apiEndpoint,
      description: 'The root base URL for the HPB V2 API Gateway',
    });
  }
}