import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { ApiMetricsService } from '@shared/api/api-metrics/api-metrics.service';

vi.mock('@aws-sdk/client-cloudwatch');

describe('ApiMetricsService', () => {
  let service: ApiMetricsService;
  let configService: ConfigService;
  let mockCloudWatchClient: CloudWatchClient;

  beforeEach(() => {
    configService = {
      get: vi.fn(),
    } as any;

    mockCloudWatchClient = {
      send: vi.fn(),
    } as any;

    vi.mocked(CloudWatchClient).mockImplementation(function () {
      return mockCloudWatchClient;
    });

    service = new ApiMetricsService(configService);
  });

  describe('publish', () => {
    it('should not publish metrics when metrics are disabled', async () => {
      vi.mocked(configService.get).mockReturnValue('local');
      const localService = new ApiMetricsService(configService);
      await localService.publish([]);

      expect(mockCloudWatchClient.send).not.toHaveBeenCalled();
    });

    it('should publish metrics to CloudWatch when enabled', async () => {
      vi.mocked(configService.get).mockReturnValue('production');
      const testData = [{ MetricName: 'test', Value: 1 }];

      await service.publish(testData);

      expect(mockCloudWatchClient.send).toHaveBeenCalledWith(
        expect.any(PutMetricDataCommand),
      );
    });

    it('should handle CloudWatch publish errors gracefully', async () => {
      vi.mocked(configService.get).mockReturnValue('production');
      vi.mocked(mockCloudWatchClient.send).mockRejectedValue(
        new Error('Test error'),
      );

      await expect(service.publish([])).resolves.not.toThrow();
    });
  });

  describe('buildMetricDatum', () => {
    it('should build basic metric datums', () => {
      const result = service.buildMetricDatum('TestOp', 'GET', 200, 100);

      expect(result).toHaveLength(3);
      expect(result[0]!.MetricName).toBe('RequestLatency');
      expect(result[1]!.MetricName).toBe('RequestCount');
    });

    it('should include error metrics for 4xx status codes', () => {
      const result = service.buildMetricDatum('TestOp', 'GET', 400, 100);

      expect(result).toHaveLength(4);
      expect(result[3]!.MetricName).toBe('ErrorCount');
      expect(
        result[3]!.Dimensions?.find((d) => d.Name === 'ErrorType')?.Value,
      ).toBe('ClientError');
    });

    it('should include error metrics for 5xx status codes', () => {
      const result = service.buildMetricDatum('TestOp', 'GET', 500, 100);

      expect(result).toHaveLength(4);
      expect(result[3]!.MetricName).toBe('ErrorCount');
      expect(
        result[3]!.Dimensions?.find((d) => d.Name === 'ErrorType')?.Value,
      ).toBe('ServerError');
    });
  });

  describe('buildRouteFailureDatums', () => {
    it('should build exactly two RequestFailureCount datums', () => {
      const result = service.buildRouteFailureDatums('act/advisories', 401);

      expect(result).toHaveLength(2);
      expect(result[0]!.MetricName).toBe('RequestFailureCount');
      expect(result[1]!.MetricName).toBe('RequestFailureCount');
    });

    it('should dimension the first datum on Route only so alarms can query it', () => {
      const result = service.buildRouteFailureDatums('act/advisories', 500);

      expect(result[0]!.Dimensions).toEqual([
        { Name: 'Route', Value: 'act/advisories' },
      ]);
    });

    it('should dimension the second datum on Route and StatusCode', () => {
      const result = service.buildRouteFailureDatums('act/advisories', 403);

      expect(result[1]!.Dimensions).toEqual([
        { Name: 'Route', Value: 'act/advisories' },
        { Name: 'StatusCode', Value: '403' },
      ]);
    });

    it('should count one per datum', () => {
      const result = service.buildRouteFailureDatums('act/advisories', 404);

      expect(result[0]!.Value).toBe(1);
      expect(result[1]!.Value).toBe(1);
      expect(result[0]!.Unit).toBe('Count');
    });
  });
});
