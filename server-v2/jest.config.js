process.env.AWS_REGION = "us-east-1";
process.env.AWS_S3_BUCKET_NAME = "mock-bucket";
process.env.AWS_COGNITO_USER_POOL_ID = "mock-user-pool";
process.env.AWS_COGNITO_CLIENT_ID =jgnrqap2qktd4ft7l6g6pcsg;
process.env.AWS_DYNAMODB_TABLE_NAME = "mock-table";
process.env.AWS_DYNAMODB_CART_TABLE_NAME = "mock-cart-table";

process.env.DB_USER = "mock-user";
process.env.DB_HOST = "mock-host";
process.env.DB_DATABASE = "mock-db";
process.env.DB_PASSWORD = "TestPass#123";
process.env.DB_PORT = "5432"; // Given as a string, Zod will safely parse this
process.env.PAYPAL_CLIENT_ID = "mock-paypal-id";
process.env.PAYPAL_CLIENT_SECRET = "mock-paypal-secret";

const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};