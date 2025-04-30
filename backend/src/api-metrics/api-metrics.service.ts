import { Injectable, Logger } from "@nestjs/common";
import {
  CloudWatchClient,
  MetricDatum,
  PutMetricDataCommand,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiMetricsService {
  private readonly NAME_SPACE = "RecreationSitesAndTrailsBCAPI";
  private readonly logger = new Logger(ApiMetricsService.name);
  private readonly cloudWatch: CloudWatchClient;
  private readonly metricsEnabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.cloudWatch = new CloudWatchClient({});
    this.metricsEnabled = this.config.get<string>("NODE_ENV") !== "local";
  }

  async publish(data: MetricDatum[]): Promise<void> {
    if (!this.metricsEnabled) {
      return;
    }
    try {
      await this.cloudWatch.send(
        new PutMetricDataCommand({
          Namespace: this.NAME_SPACE,
          MetricData: data,
        }),
      );
    } catch (error) {
      this.logger.error("CloudWatch publish failed", error as any);
    }
  }

  buildMetricDatum(
    operation: string,
    method: string,
    status: number,
    latencyMs: number,
  ): MetricDatum[] {
    const timestamp = new Date();
    const baseDimensions = [
      { Name: "Operation", Value: operation },
      { Name: "StatusCode", Value: status.toString() },
    ];

    const datums: MetricDatum[] = [
      {
        MetricName: "RequestLatency",
        Value: latencyMs,
        Unit: StandardUnit.Milliseconds,
        Timestamp: timestamp,
        Dimensions: [...baseDimensions, { Name: "Method", Value: method }],
      },
      {
        MetricName: "RequestCount",
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: baseDimensions,
      },
    ];

    if (status >= 400) {
      const errorType = status >= 500 ? "ServerError" : "ClientError";
      datums.push({
        MetricName: "ErrorCount",
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          ...baseDimensions,
          { Name: "ErrorType", Value: errorType },
        ],
      });
    }

    return datums;
  }
}
