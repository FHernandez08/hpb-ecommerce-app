import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class SecurityTelemetryStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const auditTable = new dynamodb.Table(this, 'SecurityAuditTable', {
            tableName: 'SecurityAudit',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            deletionProtection: true,
            timeToLiveAttribute: 'ttl'
        });

        new cdk.CfnOutput(this, 'AuditTableARN', {
            value: auditTable.tableArn,
            description: "The Amazon Resource Name of the immutable audit trail table.",
        });
    }
}