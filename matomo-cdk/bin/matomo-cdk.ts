#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MatomoDatabaseStack } from "../lib/matomo-database-stack";
import { MatomoServiceStack } from "../lib/matomo-service-stack";
import { getEnvConfigForStage } from "../lib/config/environment-config";
import { VpcLookupStack } from "../lib/vpc-lookup-stack";

const app = new cdk.App();

// Get stage from context or default to 'dev'
const stage = app.node.tryGetContext("stage") || "dev";
const envConfig = getEnvConfigForStage(stage);

const env = {
  account: envConfig.account,
  region: envConfig.region,
};

const synthesizeCdkApp = async () => {
  // Create stacks with environment-specific naming
  const stackPrefix = `matomo-${stage}`;

  const vpcStack = await VpcLookupStack.create(app, `${stackPrefix}-vpc`, {
    env,
    envConfig,
  });

  const rdsStack = new MatomoDatabaseStack(app, `${stackPrefix}-rds`, {
    vpc: vpcStack.vpc,
    dataSubnetIds: vpcStack.dataSubnetIds,
    env,
  });

  const matomoServiceStack = new MatomoServiceStack(
    app,
    `${stackPrefix}-service`,
    {
      vpc: vpcStack.vpc,
      appSubnetIds: vpcStack.appSubnetIds,
      webSubnetIds: vpcStack.webSubnetIds,
      appSecurityGroupId: vpcStack.appSecurityGroupId,
      webSecurityGroupId: vpcStack.webSecurityGroupId,
      rdsEndpointAddress: rdsStack.dbInstance.dbInstanceEndpointAddress,
      rdsEndpointPort: rdsStack.dbInstance.dbInstanceEndpointPort,
      rdsSecretName: rdsStack.dbSecret.secretName,
      env,
      envConfig,
    },
  );

  matomoServiceStack.addDependency(rdsStack);

  // Add tags to all stacks
  const tags = {
    Environment: stage,
    Project: "Matomo",
    ManagedBy: "CDK",
  };

  cdk.Tags.of(app).add("Environment", stage);
  Object.entries(tags).forEach(([key, value]) => {
    cdk.Tags.of(app).add(key, value);
  });

  app.synth();
};

synthesizeCdkApp();
