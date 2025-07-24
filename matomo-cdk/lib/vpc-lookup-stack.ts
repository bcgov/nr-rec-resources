import { Stack, StackProps } from "aws-cdk-lib";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { EnvironmentConfig } from "./config/environment-config";
import {
  EC2Client,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface VpcLookupStackProps extends StackProps {
  envConfig: EnvironmentConfig;
}

export class VpcLookupStack extends Stack {
  private _vpc!: IVpc;
  private _appSubnetIds: string[] = [];
  private _webSubnetIds: string[] = [];
  private _dataSubnetIds: string[] = [];
  private _appSecurityGroupId: string = "";
  private _webSecurityGroupId: string = "";
  private _dataSecurityGroupId: string = "";

  public get vpc(): IVpc {
    return this._vpc;
  }
  public get appSubnetIds(): string[] {
    return this._appSubnetIds;
  }
  public get webSubnetIds(): string[] {
    return this._webSubnetIds;
  }
  public get dataSubnetIds(): string[] {
    return this._dataSubnetIds;
  }
  public get appSecurityGroupId(): string {
    return this._appSecurityGroupId;
  }
  public get webSecurityGroupId(): string {
    return this._webSecurityGroupId;
  }
  public get dataSecurityGroupId(): string {
    return this._dataSecurityGroupId;
  }

  constructor(
    scope: Construct,
    id: string,
    { envConfig, ...other }: VpcLookupStackProps,
  ) {
    super(scope, id, other);
  }

  static async create(
    scope: Construct,
    id: string,
    props: VpcLookupStackProps,
  ): Promise<VpcLookupStack> {
    const stack = new VpcLookupStack(scope, id, props);
    await stack.initialize(props.envConfig);
    return stack;
  }

  private async initialize(envConfig: EnvironmentConfig): Promise<void> {
    const vpcTagName = `${envConfig.stageTagName}_vpc`;
    const ec2Client = new EC2Client();

    this._vpc = ec2.Vpc.fromLookup(this, "ExistingVpc", {
      tags: { Name: vpcTagName },
    });

    const vpcId = this._vpc.vpcId;

    // Use SDK to look up subnets
    const subnetsResponse = await ec2Client.send(
      new DescribeSubnetsCommand({
        Filters: [{ Name: "vpc-id", Values: [vpcId] }],
      }),
    );

    // Helper function to filter subnets by prefix
    const filterSubnets = (prefix: string) =>
      subnetsResponse.Subnets?.filter((subnet) =>
        subnet.Tags?.some(
          (tag) =>
            tag.Key === "Name" &&
            tag.Value?.startsWith(`${prefix}_${envConfig.stageTagName}`),
        ),
      )
        .map((subnet) => subnet.SubnetId)
        .filter((val) => val !== undefined) ?? [];

    // Filter subnets by type
    this._appSubnetIds = filterSubnets("App");
    this._webSubnetIds = filterSubnets("Web");
    this._dataSubnetIds = filterSubnets("Data");

    // Look up security groups
    const securityGroupsResponse = await ec2Client.send(
      new DescribeSecurityGroupsCommand({
        Filters: [{ Name: "vpc-id", Values: [vpcId] }],
      }),
    );

    // Helper function to find a security group by name
    const findSecurityGroup = (name: string): string => {
      const sg = securityGroupsResponse.SecurityGroups?.find(
        (sg) => sg.GroupName === `${name}_sg`,
      );
      return sg?.GroupId ?? "";
    };

    // Get security group IDs
    this._appSecurityGroupId = findSecurityGroup("App");
    this._webSecurityGroupId = findSecurityGroup("Web");
    this._dataSecurityGroupId = findSecurityGroup("Data");
  }
}
