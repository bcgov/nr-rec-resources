import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OperationNameUtil } from '@shared/api/api-metrics/operation-name.util';

describe('OperationNameUtil', () => {
  let reflector: Reflector;
  let operationNameUtil: OperationNameUtil;
  let mockExecutionContext: ExecutionContext;
  let mockReflector: any;
  let mockContext: any;

  beforeEach(() => {
    mockReflector = {
      get: vi.fn(),
      getAll: vi.fn(),
      getAllAndMerge: vi.fn(),
      getAllAndOverride: vi.fn(),
    };
    reflector = mockReflector as unknown as Reflector;
    operationNameUtil = new OperationNameUtil(reflector);

    mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
    };
    mockExecutionContext = mockContext as unknown as ExecutionContext;
  });

  describe('get', () => {
    it('returns operationId from ApiOperationOptions', () => {
      const mockHandler = vi.fn();
      mockContext.getHandler.mockReturnValue(mockHandler);
      mockContext.getClass.mockReturnValue(vi.fn());
      mockReflector.get.mockReturnValue({ operationId: 'customOperationId' });

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        'customOperationId',
      );
      expect(mockReflector.get).toHaveBeenCalledWith(
        'swagger/apiOperation',
        mockHandler,
      );
    });

    it("returns 'Controller.handler' when no operationId", () => {
      mockContext.getHandler.mockReturnValue({ name: 'testHandler' });
      mockContext.getClass.mockReturnValue({ name: 'TestController' });
      mockReflector.get.mockReturnValue({ summary: 'Test summary' });

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        'TestController.testHandler',
      );
    });

    it("returns 'Controller.handler' when no ApiOperationOptions", () => {
      mockContext.getHandler.mockReturnValue({ name: 'testHandler' });
      mockContext.getClass.mockReturnValue({ name: 'TestController' });
      mockReflector.get.mockReturnValue(undefined);

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        'TestController.testHandler',
      );
    });

    it('handles missing names', () => {
      mockContext.getHandler.mockReturnValue({});
      mockContext.getClass.mockReturnValue({});
      mockReflector.get.mockReturnValue(undefined);

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        'undefined.undefined',
      );
    });
  });
});
