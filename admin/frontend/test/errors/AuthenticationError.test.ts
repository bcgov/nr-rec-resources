import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/authentication-error/AuthenticationError";
import {
  getKeycloakErrorMessage,
  isKeycloakError,
  isObjectWithMessage,
} from "@/errors";

// Mock the helpers to isolate AuthenticationError tests
vi.mock("@/errors/authentication-error/AuthenticationError.helpers", () => ({
  isKeycloakError: vi.fn(),
  getKeycloakErrorMessage: vi.fn(),
  isObjectWithMessage: vi.fn(),
}));

describe("AuthenticationError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructs with default message", () => {
    const err = new AuthenticationError();
    expect(err.message).toBe("Authentication error");
    expect(err.name).toBe("AuthenticationError");
  });

  it("constructs with custom message", () => {
    const err = new AuthenticationError("Custom");
    expect(err.message).toBe("Custom");
  });

  it("parse returns same instance if already AuthenticationError", () => {
    const err = new AuthenticationError("msg");
    expect(AuthenticationError.parse(err)).toBe(err);
  });

  it("parse uses Keycloak helpers if isKeycloakError returns true", () => {
    (isKeycloakError as any).mockReturnValue(true);
    (getKeycloakErrorMessage as any).mockReturnValue("kc-desc");
    const parsed = AuthenticationError.parse({
      error: "e",
      error_description: "d",
    });
    expect(isKeycloakError).toHaveBeenCalled();
    expect(getKeycloakErrorMessage).toHaveBeenCalled();
    expect(parsed.message).toBe("kc-desc");
  });

  it("parse uses native Error message if not KeycloakError", () => {
    (isKeycloakError as any).mockReturnValue(false);
    (isObjectWithMessage as any).mockReturnValue(false);
    const err = new Error("native");
    const parsed = AuthenticationError.parse(err);
    expect(parsed.message).toBe("native");
  });

  it("parse uses string error if not KeycloakError", () => {
    (isKeycloakError as any).mockReturnValue(false);
    (isObjectWithMessage as any).mockReturnValue(false);
    const parsed = AuthenticationError.parse("str");
    expect(parsed.message).toBe("str");
  });

  it("parse uses object message if isObjectWithMessage returns true", () => {
    (isKeycloakError as any).mockReturnValue(false);
    (isObjectWithMessage as any).mockReturnValue(true);
    const parsed = AuthenticationError.parse({ message: "obj-msg" });
    expect(parsed.message).toBe("obj-msg");
  });

  it("parse falls back to unknown error", () => {
    (isKeycloakError as any).mockReturnValue(false);
    (isObjectWithMessage as any).mockReturnValue(false);
    const parsed = AuthenticationError.parse({ foo: "bar" });
    expect(parsed.message).toBe("Unknown authentication error");
  });

  it("getMessage returns the message", () => {
    const err = new AuthenticationError("msg");
    expect(err.getMessage()).toBe("msg");
  });
});
