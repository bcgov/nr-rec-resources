import { AuthenticationError } from "@/errors";
import { ResponseError } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Response class for testing
class MockResponse {
  public status: number;
  private jsonData: any;

  constructor(status: number, jsonData?: any) {
    this.status = status;
    this.jsonData = jsonData;
  }

  async json() {
    if (this.jsonData === undefined) {
      throw new Error("Failed to parse JSON");
    }
    return this.jsonData;
  }
}

// Test utilities
const createResponseError = (status: number, jsonData?: any) =>
  new ResponseError(new MockResponse(status, jsonData) as any, "Test error");

const expectErrorResult = (
  result: any,
  expected: {
    statusCode: number;
    message: string;
    isResponseError: boolean;
    isAuthError: boolean;
  },
) => {
  expect(result).toEqual(expected);
};

describe("handleApiError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ResponseError handling", () => {
    it("should handle ResponseError with different message formats", async () => {
      const testCases = [
        {
          name: "basic error message",
          response: { message: "Internal server error occurred" },
          status: 500,
          expected: "Internal server error occurred",
        },
        {
          name: "error field instead of message",
          response: { error: "Bad request error" },
          status: 400,
          expected: "Bad request error",
        },
        {
          name: "no message or error field",
          response: { data: "some other data" },
          status: 404,
          expected: "HTTP 404 Error",
        },
      ];

      for (const testCase of testCases) {
        const result = await handleApiError(
          createResponseError(testCase.status, testCase.response),
        );
        expectErrorResult(result, {
          statusCode: testCase.status,
          message: testCase.expected,
          isResponseError: true,
          isAuthError: testCase.status === 401 || testCase.status === 403,
        });
      }
    });

    it("should handle validation errors", async () => {
      const validationResponse = {
        message: "Validation failed",
        details: [
          {
            field: "email",
            messages: ["Email is required", "Email format is invalid"],
          },
          {
            field: "password",
            messages: ["Password must be at least 8 characters"],
          },
        ],
      };

      const result = await handleApiError(
        createResponseError(400, validationResponse),
      );
      expectErrorResult(result, {
        statusCode: 400,
        message:
          "Validation Error: email: Email is required, Email format is invalid; password: Password must be at least 8 characters",
        isResponseError: true,
        isAuthError: false,
      });
    });

    it("should handle malformed validation details", async () => {
      const testCases = [
        {
          name: "non-array details",
          details: "not an array",
          expectedMessage: "Bad request",
        },
        {
          name: "mixed valid/invalid details",
          details: [
            { field: "email", messages: ["Email is required"] }, // Valid
            { field: "email" }, // Missing messages
            { messages: ["Password required"] }, // Missing field
            null, // Invalid
            "invalid", // Invalid type
          ],
          expectedMessage: "Validation Error: email: Email is required",
        },
        {
          name: "all invalid details",
          details: [
            { field: "email" }, // Missing messages
            { messages: ["Password required"] }, // Missing field
            null, // Invalid
            "invalid", // Invalid type
          ],
          expectedMessage: "Bad request",
        },
        {
          name: "empty details array with no message",
          details: [],
          expectedMessage: "HTTP 400 Error",
        },
      ];

      for (const { name, details, expectedMessage } of testCases) {
        const response =
          name === "empty details array with no message"
            ? { details }
            : { message: "Bad request", details };
        const result = await handleApiError(createResponseError(400, response));
        expect(result.message).toBe(expectedMessage);
      }
    });

    it("should handle JSON parsing failures", async () => {
      const result = await handleApiError(createResponseError(503)); // No jsonData provided
      expectErrorResult(result, {
        statusCode: 503,
        message: "HTTP 503 Error",
        isResponseError: true,
        isAuthError: false,
      });
    });

    it("should use default error messages for known status codes", async () => {
      const statusCodes = [
        { status: 400, expected: "Bad Request - Invalid input provided" },
        { status: 401, expected: "Unauthorized - Please log in again" },
        {
          status: 403,
          expected:
            "Forbidden - You don't have permission to perform this action",
        },
        {
          status: 404,
          expected: "Not Found - The requested resource was not found",
        },
        {
          status: 415,
          expected: "Unsupported Media Type - File type not allowed",
        },
        {
          status: 500,
          expected: "Internal Server Error - Please try again later",
        },
        { status: 999, expected: "HTTP 999 Error" },
      ];

      for (const { status, expected } of statusCodes) {
        const result = await handleApiError(createResponseError(status));
        expect(result.message).toBe(expected);
        expect(result.statusCode).toBe(status);
        expect(result.isAuthError).toBe(status === 401 || status === 403);
      }
    });

    it("should handle circular JSON errors", async () => {
      const mockResponse = new MockResponse(500, { message: "Test" });
      mockResponse.json = async () => {
        throw new Error("Converting circular structure to JSON");
      };

      const result = await handleApiError(
        new ResponseError(mockResponse as any, "Test error"),
      );
      expectErrorResult(result, {
        statusCode: 500,
        message: "Internal Server Error - Please try again later",
        isResponseError: true,
        isAuthError: false,
      });
    });
  });

  describe("AuthenticationError handling", () => {
    it("should handle AuthenticationError with custom and default messages", async () => {
      const testCases = [
        {
          error: new AuthenticationError("Custom auth error message"),
          expected: "Custom auth error message",
        },
        { error: new AuthenticationError(), expected: "Authentication error" },
      ];

      for (const { error, expected } of testCases) {
        const result = await handleApiError(error);
        expectErrorResult(result, {
          statusCode: 401,
          message: expected,
          isResponseError: false,
          isAuthError: true,
        });
      }
    });
  });

  describe("Native Error handling", () => {
    it("should handle native Error instances", async () => {
      const errors = [
        new Error("Something went wrong"),
        new TypeError("Type error occurred"),
      ];

      for (const error of errors) {
        const result = await handleApiError(error);
        expectErrorResult(result, {
          statusCode: 500,
          message: error.message,
          isResponseError: false,
          isAuthError: false,
        });
      }
    });
  });

  describe("String and unknown error handling", () => {
    it("should handle string errors", async () => {
      const testCases = [
        {
          input: "Network connection failed",
          expected: "Network connection failed",
        },
        { input: "", expected: "" },
      ];

      for (const { input, expected } of testCases) {
        const result = await handleApiError(input);
        expectErrorResult(result, {
          statusCode: 500,
          message: expected,
          isResponseError: false,
          isAuthError: false,
        });
      }
    });

    it("should handle unknown error types", async () => {
      const unknownErrors = [
        null,
        undefined,
        404,
        { code: "NETWORK_ERROR", details: "Connection timeout" },
        false,
        ["error1", "error2"],
      ];

      for (const error of unknownErrors) {
        const result = await handleApiError(error);
        expectErrorResult(result, {
          statusCode: 500,
          message: "An unknown error occurred",
          isResponseError: false,
          isAuthError: false,
        });
      }
    });
  });

  describe("Type safety", () => {
    it("should return correct ApiErrorInfo interface structure", async () => {
      const result = await handleApiError(new Error("Test error"));

      expect(result).toHaveProperty("statusCode");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("isResponseError");
      expect(result).toHaveProperty("isAuthError");

      expect(typeof result.statusCode).toBe("number");
      expect(typeof result.message).toBe("string");
      expect(typeof result.isResponseError).toBe("boolean");
      expect(typeof result.isAuthError).toBe("boolean");
    });
  });
});
