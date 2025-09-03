import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CloudWatchClient,
  MetricDatum,
  PutMetricDataCommand,
  StandardUnit,
} from '@aws-sdk/client-cloudwatch';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_METRIC_NAMESPACE_NAME_PREFIX,
  ENV_VARS,
  EnvValues,
  ErrorTypes,
  MetricDimensions,
  MetricNames,
} from './api-metrics.constants';

@Injectable()
export class ApiMetricsService {
  private readonly logger = new Logger(ApiMetricsService.name);
  private readonly cloudWatch: CloudWatchClient;
  private readonly metricsEnabled: boolean;
  private readonly metricNamespaceName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly namespacePrefix: string = DEFAULT_METRIC_NAMESPACE_NAME_PREFIX,
  ) {
    this.cloudWatch = new CloudWatchClient({});
    const appEnv = this.configService.get<string>(ENV_VARS.APP_ENV);
    this.metricsEnabled = appEnv !== EnvValues.LOCAL;
    this.metricNamespaceName = `${this.namespacePrefix}-${appEnv}`;
  }

  async publish(data: MetricDatum[]): Promise<void> {
    if (!this.metricsEnabled) {
      return;
    }

    try {
      await this.cloudWatch.send(
        new PutMetricDataCommand({
          Namespace: this.metricNamespaceName,
          MetricData: data,
        }),
      );
    } catch (error) {
      this.logger.error('CloudWatch publish failed', error as any);
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
      { Name: MetricDimensions.OPERATION, Value: operation },
    ];

    const datums: MetricDatum[] = [
      {
        MetricName: MetricNames.REQUEST_LATENCY,
        Value: latencyMs,
        Unit: StandardUnit.Milliseconds,
        Timestamp: timestamp,
        Dimensions: [
          ...baseDimensions,
          { Name: MetricDimensions.METHOD, Value: method },
        ],
      },
      {
        MetricName: MetricNames.REQUEST_COUNT,
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: baseDimensions,
      },
      {
        MetricName: MetricNames.RESPONSE_CODE_COUNT,
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          ...baseDimensions,
          { Name: MetricDimensions.STATUS_CODE, Value: status.toString() },
        ],
      },
    ];

    if (status >= HttpStatus.BAD_REQUEST) {
      const errorType =
        status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? ErrorTypes.SERVER
          : ErrorTypes.CLIENT;
      datums.push({
        MetricName: MetricNames.ERROR_COUNT,
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: timestamp,
        Dimensions: [
          ...baseDimensions,
          { Name: MetricDimensions.ERROR_TYPE, Value: errorType },
        ],
      });
    }

    return datums;
  }
}
