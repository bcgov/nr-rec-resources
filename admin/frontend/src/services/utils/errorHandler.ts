import { AuthenticationError } from "@/errors";
import {
  ResponseError,
  ValidationErrorDetailDto,
} from "@/services/recreation-resource-admin";

export interface ApiErrorInfo {
  statusCode: number;
  message: string;
  isResponseError: boolean;
  isAuthError: boolean;
}

/**
 * Centralized error handler for API calls
 */
export async function handleApiError(error: unknown): Promise<ApiErrorInfo> {
  // Handle ResponseError (from your API client)
  if (error instanceof ResponseError) {
    let message = "An error occurred";
    const statusCode = error.response.status;

    try {
      // Try to extract message from response body
      const errorBody = await error.response.json();
      message =
        errorBody.message || errorBody.error || `HTTP ${statusCode} Error`;

      // Handle validation errors (BadRequestResponseDto)
      if (
        statusCode === 400 &&
        errorBody.details &&
        Array.isArray(errorBody.details)
      ) {
        const validationMessages = errorBody.details
          .filter(
            (detail: ValidationErrorDetailDto) =>
              detail &&
              typeof detail === "object" &&
              detail.field &&
              Array.isArray(detail.messages),
          )
          .map(
            (detail: ValidationErrorDetailDto) =>
              `${detail.field}: ${detail.messages.join(", ")}`,
          )
          .join("; ");

        if (validationMessages) {
          message = `Validation Error: ${validationMessages}`;
        }
      }
    } catch {
      // If response body parsing fails, use default message
      message = getDefaultErrorMessage(statusCode);
    }

    return {
      statusCode,
      message,
      isResponseError: true,
      isAuthError: statusCode === 401 || statusCode === 403,
    };
  }

  // Handle AuthenticationError
  if (error instanceof AuthenticationError) {
    return {
      statusCode: 401,
      message: error.getMessage(),
      isResponseError: false,
      isAuthError: true,
    };
  }

  // Handle native Error
  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
      isResponseError: false,
      isAuthError: false,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      statusCode: 500,
      message: error,
      isResponseError: false,
      isAuthError: false,
    };
  }

  // Handle unknown errors
  return {
    statusCode: 500,
    message: "An unknown error occurred",
    isResponseError: false,
    isAuthError: false,
  };
}

function getDefaultErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Bad Request - Invalid input provided";
    case 401:
      return "Unauthorized - Please log in again";
    case 403:
      return "Forbidden - You don't have permission to perform this action";
    case 404:
      return "Not Found - The requested resource was not found";
    case 415:
      return "Unsupported Media Type - File type not allowed";
    case 500:
      return "Internal Server Error - Please try again later";
    default:
      return `HTTP ${statusCode} Error`;
  }
}
