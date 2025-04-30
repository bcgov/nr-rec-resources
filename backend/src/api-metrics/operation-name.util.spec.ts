import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationNameUtil } from "./operation-name.util";

describe("OperationNameUtil", () => {
  let reflector: any;
  let operationNameUtil: OperationNameUtil;
  let mockExecutionContext: any;

  beforeEach(() => {
    reflector = {
      get: vi.fn(),
    };

    operationNameUtil = new OperationNameUtil(reflector);

    mockExecutionContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
    };
  });

  describe("get", () => {
    it("should return operationId when specified in ApiOperationOptions", () => {
      const mockHandler = vi.fn();
      const mockController = vi.fn();
      const expectedOperationId = "customOperationId";

      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(mockController);
      reflector.get.mockReturnValue({
        operationId: expectedOperationId,
        summary: "Test summary",
      });

      const result = operationNameUtil.get(mockExecutionContext);

      expect(result).toBe(expectedOperationId);
      expect(reflector.get).toHaveBeenCalledWith(
        "swagger/apiOperation",
        mockHandler,
      );
    });

    it("should return 'Controller.handler' format when ApiOperationOptions lacks operationId", () => {
      const mockHandler = { name: "testHandler" };
      const mockController = { name: "TestController" };
      const expectedName = "TestController.testHandler";

      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(mockController);
      reflector.get.mockReturnValue({ summary: "Test summary" });

      const result = operationNameUtil.get(mockExecutionContext);

      expect(result).toBe(expectedName);
    });

    it("should return 'Controller.handler' format when ApiOperationOptions is missing", () => {
      const mockHandler = { name: "testHandler" };
      const mockController = { name: "TestController" };
      const expectedName = "TestController.testHandler";

      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(mockController);
      reflector.get.mockReturnValue(undefined);

      const result = operationNameUtil.get(mockExecutionContext);

      expect(result).toBe(expectedName);
    });

    it("should handle missing handler or controller names gracefully", () => {
      const mockHandler = {};
      const mockController = {};

      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(mockController);
      reflector.get.mockReturnValue(undefined);

      const result = operationNameUtil.get(mockExecutionContext);

      expect(result).toBe("undefined.undefined");
    });
  });
});
