import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { createRouteFailureMetricsHandler } from '@/config/route-failure-metrics.config';

const ROUTE = 'act/advisories';

function createRes(statusCode: number): Response {
  const res = new EventEmitter() as EventEmitter & Response;
  res.statusCode = statusCode;
  return res;
}

function createService() {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    buildRouteFailureDatums: vi.fn(() => [
      { MetricName: 'RequestFailureCount' },
    ]),
  };
}

describe('createRouteFailureMetricsHandler', () => {
  let apiMetricsService: ReturnType<typeof createService>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    apiMetricsService = createService();
    next = vi.fn();
  });

  function run(statusCode: number) {
    const handler = createRouteFailureMetricsHandler(
      ROUTE,
      apiMetricsService as any,
    );
    const res = createRes(statusCode);
    handler({} as Request, res, next);
    return res;
  }

  it('always calls next synchronously', () => {
    run(200);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not publish before the response finishes', () => {
    run(500);

    expect(apiMetricsService.publish).not.toHaveBeenCalled();
  });

  it('does not publish for a successful response', () => {
    const res = run(201);
    res.emit('finish');

    expect(apiMetricsService.publish).not.toHaveBeenCalled();
  });

  it('publishes for a 4xx response', () => {
    const res = run(401);
    res.emit('finish');

    expect(apiMetricsService.buildRouteFailureDatums).toHaveBeenCalledWith(
      ROUTE,
      401,
    );
    expect(apiMetricsService.publish).toHaveBeenCalledTimes(1);
  });

  it('publishes for a 5xx response', () => {
    const res = run(503);
    res.emit('finish');

    expect(apiMetricsService.buildRouteFailureDatums).toHaveBeenCalledWith(
      ROUTE,
      503,
    );
    expect(apiMetricsService.publish).toHaveBeenCalledTimes(1);
  });

  it('does not throw when publish rejects', () => {
    apiMetricsService.publish.mockRejectedValue(new Error('cloudwatch down'));
    const res = run(500);

    expect(() => res.emit('finish')).not.toThrow();
  });

  it('does not throw when building the datums fails', () => {
    apiMetricsService.buildRouteFailureDatums.mockImplementation(() => {
      throw new Error('unexpected');
    });
    const res = run(400);

    expect(() => res.emit('finish')).not.toThrow();
    expect(apiMetricsService.publish).not.toHaveBeenCalled();
  });
});
