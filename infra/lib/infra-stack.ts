import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
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

    // lambda function for the HTTP API handler
    const hpbHttpApiLambda = new lambda.Function(this, 'LambdaHandler', {
      functionName: 'hpbWebAppApiFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../server-v2/src/lambda')),
      handler: 'handler.handler',
      environment: {
        STAGE: 'dev',
      }
    });

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

    
    /* stages */
    hpbAdminHttpApi.addStage('DevStage', {
      stageName: 'dev',
      autoDeploy: true,
    })
    
    /* Outputs */
    
    // Output for health endpoint
    new cdk.CfnOutput(this, 'healthEndpoint', {
      value: hpbAdminHttpApi.apiEndpoint + '/health',
      description: 'The endpoint URL for the /health route',
    });

  }
}