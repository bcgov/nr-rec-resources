import { describe, expect, it } from "vitest";
import { BadRequestResponseDto } from "@/common/dtos/bad-request-response.dto";
import { ValidationErrorDetailDto } from "@/common/dtos/validation-error-detail.dto";

describe("BadRequestResponseDto", () => {
  it("should create an instance of BadRequestResponseDto", () => {
    const badRequestResponseDto = new BadRequestResponseDto();
    expect(badRequestResponseDto).toBeInstanceOf(BadRequestResponseDto);
  });

  it("should have the correct properties and types", () => {
    const badRequestResponseDto = new BadRequestResponseDto();
    badRequestResponseDto.message = "Bad Request";
    badRequestResponseDto.details = [
      {
        field: "email",
        messages: ["email must be an email"],
      } as ValidationErrorDetailDto,
    ];
    badRequestResponseDto.timestamp = new Date().toISOString();
    badRequestResponseDto.path = "/api/v1/users";

    expect(badRequestResponseDto.statusCode).toBe(400);
    expect(typeof badRequestResponseDto.message).toBe("string");
    expect(Array.isArray(badRequestResponseDto.details)).toBe(true);
    expect(typeof badRequestResponseDto.timestamp).toBe("string");
    expect(typeof badRequestResponseDto.path).toBe("string");
  });

  it("should match the example values", () => {
    const badRequestResponseDto = new BadRequestResponseDto();
    badRequestResponseDto.message = "Bad Request";
    badRequestResponseDto.details = [
      {
        field: "email",
        messages: ["email must be an email"],
      } as ValidationErrorDetailDto,
    ];
    badRequestResponseDto.timestamp = new Date().toISOString();
    badRequestResponseDto.path = "/api/v1/users";

    expect(badRequestResponseDto.statusCode).toBe(400);
    expect(badRequestResponseDto.message).toBe("Bad Request");
    expect(badRequestResponseDto.details[0].field).toBe("email");
    expect(badRequestResponseDto.details[0].messages[0]).toBe(
      "email must be an email",
    );
    expect(badRequestResponseDto.path).toBe("/api/v1/users");
  });
});
