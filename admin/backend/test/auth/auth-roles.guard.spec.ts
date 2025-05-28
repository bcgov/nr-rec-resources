import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthRolesGuard } from "../../src/auth";
import { createMockExecutionContext } from "../test-utils/mock-execution-context";

describe("AuthRolesGuard", () => {
  let guard: AuthRolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthRolesGuard>(AuthRolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("Mode: any", () => {
    it("should return true when no roles are required", () => {
      vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
      const mockContext = createMockExecutionContext();
      const result = guard.canActivate(mockContext as ExecutionContext);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it("should return true when user has one of the required roles", () => {
      vi.spyOn(reflector, "getAllAndOverride").mockReturnValue({
        roles: ["admin"],
        mode: "any",
      });
      const mockContext = createMockExecutionContext({
        user: { client_roles: ["admin", "user"] },
      });
      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    });

    // Combine multiple negative cases using test.each
    it.each([
      { userRoles: ["user"], description: "lacking the required role" },
      { userRoles: [], description: "with an empty roles array" },
      { userRoles: undefined, description: "without client_roles property" },
    ])(
      "should throw ForbiddenException when user is $description",
      ({ userRoles }) => {
        vi.spyOn(reflector, "getAllAndOverride").mockReturnValue({
          roles: ["admin"],
          mode: "any",
        });
        const mockContext = createMockExecutionContext({
          user: { client_roles: userRoles },
        });
        expect(() =>
          guard.canActivate(mockContext as ExecutionContext),
        ).toThrow(ForbiddenException);
      },
    );
  });

  describe("Mode: all", () => {
    it("should return true when user has all required roles", () => {
      vi.spyOn(reflector, "getAllAndOverride").mockReturnValue({
        roles: ["admin", "user"],
        mode: "all",
      });
      const mockContext = createMockExecutionContext({
        user: { client_roles: ["admin", "user", "extra"] },
      });
      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    });

    it("should throw ForbiddenException when user is missing one required role", () => {
      vi.spyOn(reflector, "getAllAndOverride").mockReturnValue({
        roles: ["admin", "user"],
        mode: "all",
      });
      const mockContext = createMockExecutionContext({
        user: { client_roles: ["admin"] },
      });
      expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});
