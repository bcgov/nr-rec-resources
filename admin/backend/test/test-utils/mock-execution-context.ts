import { ExecutionContext } from "@nestjs/common";

/**
 * Creates a mock execution context for testing guards and interceptors
 *
 * @param requestOverrides - Overrides for the request object
 * @returns A mock execution context object
 */
export function createMockExecutionContext(
  requestOverrides = {},
): ExecutionContext {
  const mockRequest = {
    user: {},
    headers: {},
    ...requestOverrides,
  };

  const contextMap = {
    http: {
      getRequest: () => mockRequest,
      getResponse: () => ({}),
    },
  };

  return {
    switchToHttp: () => contextMap.http,
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}
