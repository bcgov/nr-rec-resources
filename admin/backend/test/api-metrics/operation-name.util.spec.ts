import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationNameUtil } from "@/api-metrics/operation-name.util";

describe("OperationNameUtil", () => {
  let reflector, operationNameUtil, mockExecutionContext;

  beforeEach(() => {
    reflector = { get: vi.fn() };
    operationNameUtil = new OperationNameUtil(reflector);
    mockExecutionContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
    };
  });

  describe("get", () => {
    it("returns operationId from ApiOperationOptions", () => {
      const mockHandler = vi.fn();
      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(vi.fn());
      reflector.get.mockReturnValue({ operationId: "customOperationId" });

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        "customOperationId",
      );
      expect(reflector.get).toHaveBeenCalledWith(
        "swagger/apiOperation",
        mockHandler,
      );
    });

    it("returns 'Controller.handler' when no operationId", () => {
      mockExecutionContext.getHandler.mockReturnValue({ name: "testHandler" });
      mockExecutionContext.getClass.mockReturnValue({ name: "TestController" });
      reflector.get.mockReturnValue({ summary: "Test summary" });

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        "TestController.testHandler",
      );
    });

    it("returns 'Controller.handler' when no ApiOperationOptions", () => {
      mockExecutionContext.getHandler.mockReturnValue({ name: "testHandler" });
      mockExecutionContext.getClass.mockReturnValue({ name: "TestController" });
      reflector.get.mockReturnValue(undefined);

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        "TestController.testHandler",
      );
    });

    it("handles missing names", () => {
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.getClass.mockReturnValue({});
      reflector.get.mockReturnValue(undefined);

      expect(operationNameUtil.get(mockExecutionContext)).toBe(
        "undefined.undefined",
      );
    });
  });
});
