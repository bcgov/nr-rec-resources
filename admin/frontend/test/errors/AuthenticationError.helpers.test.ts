import { describe, expect, it } from "vitest";
import {
  getKeycloakErrorMessage,
  isKeycloakError,
  isObjectWithMessage,
} from "@/errors";

describe("AuthenticationError helpers", () => {
  describe("isKeycloakError", () => {
    it("returns true for valid KeycloakError shape", () => {
      expect(isKeycloakError({ error: "err", error_description: "desc" })).toBe(
        true,
      );
    });
    it("returns false if missing error", () => {
      expect(isKeycloakError({ error_description: "desc" })).toBe(false);
    });
    it("returns false if missing error_description", () => {
      expect(isKeycloakError({ error: "err" })).toBe(false);
    });
    it("returns false for non-object", () => {
      expect(isKeycloakError(null)).toBe(false);
      expect(isKeycloakError("err")).toBe(false);
    });
  });

  describe("getKeycloakErrorMessage", () => {
    it("returns error_description if present and non-empty", () => {
      expect(
        getKeycloakErrorMessage({ error: "err", error_description: "desc" }),
      ).toBe("desc");
    });
    it("returns error if error_description is empty", () => {
      expect(
        getKeycloakErrorMessage({ error: "err", error_description: "" }),
      ).toBe("err");
    });
    it("returns 'Keycloak error' if both are empty", () => {
      expect(
        getKeycloakErrorMessage({ error: "", error_description: "" }),
      ).toBe("Keycloak error");
    });
    it("trims error_description and error", () => {
      expect(
        getKeycloakErrorMessage({ error: "  err  ", error_description: "   " }),
      ).toBe("err");
    });
  });

  describe("isObjectWithMessage", () => {
    it("returns true for object with string message", () => {
      expect(isObjectWithMessage({ message: "msg" })).toBe(true);
    });
    it("returns false for object without message", () => {
      expect(isObjectWithMessage({ foo: "bar" })).toBe(false);
    });
    it("returns false for non-object", () => {
      expect(isObjectWithMessage("msg")).toBe(false);
      expect(isObjectWithMessage(null)).toBe(false);
    });
  });
});
