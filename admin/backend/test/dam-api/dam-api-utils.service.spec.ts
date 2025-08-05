import { Test, TestingModule } from "@nestjs/testing";
import { createHash } from "crypto";
import FormData from "form-data";
import { beforeEach, describe, expect, it } from "vitest";
import { DamApiUtilsService } from "../../src/dam-api/dam-api-utils.service";
import { DamApiConfig } from "../../src/dam-api/dam-api.types";

describe("DamApiUtilsService", () => {
  let service: DamApiUtilsService;
  let mockConfig: DamApiConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DamApiUtilsService],
    }).compile();

    service = module.get<DamApiUtilsService>(DamApiUtilsService);

    mockConfig = {
      damUrl: "https://test-dam.example.com",
      privateKey: "test-private-key",
      user: "test-user",
      pdfCollectionId: "pdf-123",
      imageCollectionId: "image-123",
      pdfResourceType: 1,
      imageResourceType: 2,
    };
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sign", () => {
    it("should create SHA256 hash of private key + query", () => {
      const query = "function=test&param=value";
      const privateKey = "secret-key";

      const result = service.sign(query, privateKey);

      // Verify it matches expected SHA256 hash
      const expected = createHash("sha256")
        .update(`${privateKey}${query}`)
        .digest("hex");

      expect(result).toBe(expected);
    });

    it("should return different signatures for different queries", () => {
      const privateKey = "secret-key";
      const query1 = "function=test1";
      const query2 = "function=test2";

      const signature1 = service.sign(query1, privateKey);
      const signature2 = service.sign(query2, privateKey);

      expect(signature1).not.toBe(signature2);
    });

    it("should return different signatures for different private keys", () => {
      const query = "function=test";
      const privateKey1 = "secret-key-1";
      const privateKey2 = "secret-key-2";

      const signature1 = service.sign(query, privateKey1);
      const signature2 = service.sign(query, privateKey2);

      expect(signature1).not.toBe(signature2);
    });

    it("should handle empty strings", () => {
      const result = service.sign("", "key");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64); // SHA256 hex string length
    });
  });

  describe("createFormData", () => {
    it("should create FormData with query, sign, and user fields", () => {
      const params = { function: "create_resource", title: "Test" };

      const formData = service.createFormData(params, mockConfig);

      expect(formData).toBeInstanceOf(FormData);

      // Check that required fields are present
      const formDataFields = formData.getBuffer().toString();
      expect(formDataFields).toContain("query");
      expect(formDataFields).toContain("sign");
      expect(formDataFields).toContain("user");
      expect(formDataFields).toContain(mockConfig.user);
    });

    it("should include all parameters in query string", () => {
      const params = {
        function: "create_resource",
        title: "Test Resource",
        resource_type: 1,
      };

      const formData = service.createFormData(params, mockConfig);
      const formDataBuffer = formData.getBuffer().toString();

      expect(formDataBuffer).toContain("function=create_resource");
      expect(formDataBuffer).toContain("title=Test+Resource");
      expect(formDataBuffer).toContain("resource_type=1");
    });

    it("should sign the query string correctly", () => {
      const params = { function: "test", param: "value" };
      const formData = service.createFormData(params, mockConfig);

      // Extract the signature from form data
      const formDataBuffer = formData.getBuffer().toString();
      const signMatch = formDataBuffer.match(/name="sign"[^]*?([a-f0-9]{64})/);
      const extractedSign = signMatch?.[1];

      // Calculate expected signature
      const queryString = new URLSearchParams(params).toString();
      const expectedSign = service.sign(queryString, mockConfig.privateKey);

      expect(extractedSign).toBe(expectedSign);
    });

    it("should handle special characters in parameters", () => {
      const params = {
        title: "Test & Special Characters",
        description: 'Test with quotes "and" apostrophes\'',
      };

      const formData = service.createFormData(params, mockConfig);

      expect(formData).toBeInstanceOf(FormData);
      const formDataBuffer = formData.getBuffer().toString();
      expect(formDataBuffer).toContain("query");
    });
  });

  describe("validateFileTypes", () => {
    const requiredSizes = ["thm", "scr", "orig"] as const;

    it("should return true when all required file types are present", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "scr", path: "/path/screen.jpg" },
        { size_code: "orig", path: "/path/original.jpg" },
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(true);
    });

    it("should return true when all required files are present with extra files", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "scr", path: "/path/screen.jpg" },
        { size_code: "orig", path: "/path/original.jpg" },
        { size_code: "other", path: "/path/other.jpg" }, // Extra file
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(true);
    });

    it("should return false when not all required file types are present", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "scr", path: "/path/screen.jpg" },
        // Missing "orig" - should return false
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(false);
    });

    it("should return false when only some required file types are present", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "other", path: "/path/other.jpg" },
        // Missing "scr" and "orig" - should return false
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(false);
    });

    it("should return false when files array is empty", () => {
      const result = service.validateFileTypes([], requiredSizes);

      expect(result).toBe(false);
    });

    it("should return false when files is not an array", () => {
      const result = service.validateFileTypes(
        "not-an-array" as any,
        requiredSizes,
      );

      expect(result).toBe(false);
    });

    it("should return false when files is null", () => {
      const result = service.validateFileTypes(null as any, requiredSizes);

      expect(result).toBe(false);
    });

    it("should return false when files is undefined", () => {
      const result = service.validateFileTypes(undefined as any, requiredSizes);

      expect(result).toBe(false);
    });

    it("should return true when no file types are required", () => {
      const files = [{ size_code: "other", path: "/path/other.jpg" }];

      const result = service.validateFileTypes(files, []);

      expect(result).toBe(true);
    });

    it("should return false when files don't match any required size codes", () => {
      const files = [
        { size_code: "unknown1", path: "/path/unknown1.jpg" },
        { size_code: "unknown2", path: "/path/unknown2.jpg" },
        { size_code: "unknown3", path: "/path/unknown3.jpg" },
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(false); // Should return false as none of the required sizes are present
    });
  });
});
