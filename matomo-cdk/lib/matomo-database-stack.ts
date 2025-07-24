import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { IVpc } from "aws-cdk-lib/aws-ec2";

interface MatomoDatabaseStackProps extends cdk.StackProps {
  vpc: IVpc;
  dataSubnetIds: string[];
}

export class MatomoDatabaseStack extends cdk.Stack {
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly rdsSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: MatomoDatabaseStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const privateSubnets = props.dataSubnetIds.map((subnetId) =>
      ec2.Subnet.fromSubnetId(this, `PrivateSubnet-${subnetId}`, subnetId),
    );

    this.rdsSecurityGroup = ec2.SecurityGroup.fromLookupByName(
      this,
      "MatomoRdsSecurityGroup",
      "Data_sg",
      vpc,
    );

    this.dbSecret = new secretsmanager.Secret(this, "MatomoDbCredentials", {
      secretName: "matomo-rds-credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "matomo" }),
        generateStringKey: "password",
        passwordLength: 16,
        excludePunctuation: true,
      },
    });

    this.dbInstance = new rds.DatabaseInstance(this, "MatomoMariaDbInstance", {
      engine: rds.DatabaseInstanceEngine.mariaDb({
        version: rds.MariaDbEngineVersion.VER_11_4_4,
      }),
      vpc,
      vpcSubnets: { subnets: privateSubnets },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MEDIUM,
      ),
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      securityGroups: [this.rdsSecurityGroup as ec2.SecurityGroup],
      databaseName: "matomo",
      publiclyAccessible: false,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      deletionProtection: false,
      storageEncrypted: true,
    });

    new cdk.CfnOutput(this, "DbEndpoint", {
      description: "MariaDB Instance Endpoint",
      value: this.dbInstance.instanceEndpoint.socketAddress,
    });

    new cdk.CfnOutput(this, "RdsSecretName", {
      description: "RDS MariaDB Secret Name",
      value: this.dbSecret.secretName,
    });
  }
}
