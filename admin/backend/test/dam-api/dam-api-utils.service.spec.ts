import { DamApiConfig, DamApiUtilsService } from "@/dam-api";
import { Test, TestingModule } from "@nestjs/testing";
import { createHash } from "crypto";
import FormData from "form-data";
import { beforeEach, describe, expect, it } from "vitest";

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

    it("should handle empty private key", () => {
      const query = "function=test";
      const result = service.sign(query, "");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64); // SHA256 hex string length
    });

    it("should handle special characters in query", () => {
      const query = "function=test&special=!@#$%^&*()";
      const privateKey = "key";
      const result = service.sign(query, privateKey);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64);
    });

    it("should handle special characters in private key", () => {
      const query = "function=test";
      const privateKey = "key!@#$%^&*()";
      const result = service.sign(query, privateKey);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64);
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

    it("should handle empty parameters object", () => {
      const params = {};

      const formData = service.createFormData(params, mockConfig);

      expect(formData).toBeInstanceOf(FormData);
      const formDataBuffer = formData.getBuffer().toString();
      expect(formDataBuffer).toContain("query");
      expect(formDataBuffer).toContain("sign");
      expect(formDataBuffer).toContain("user");
    });

    it("should handle numeric parameters", () => {
      const params = {
        id: 123,
        price: 45.67,
        active: true,
      };

      const formData = service.createFormData(params, mockConfig);

      expect(formData).toBeInstanceOf(FormData);
      const formDataBuffer = formData.getBuffer().toString();
      expect(formDataBuffer).toContain("id=123");
      expect(formDataBuffer).toContain("price=45.67");
      expect(formDataBuffer).toContain("active=true");
    });

    it("should handle null and undefined parameters", () => {
      const params = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
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

    it("should handle duplicate file types correctly", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb1.jpg" },
        { size_code: "thm", path: "/path/thumb2.jpg" }, // Duplicate size_code
        { size_code: "scr", path: "/path/screen.jpg" },
        { size_code: "orig", path: "/path/original.jpg" },
      ];

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(true); // Should still return true as all required types are present
    });

    it("should handle files with missing size_code property", () => {
      const files = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { path: "/path/nosizecode.jpg" }, // Missing size_code
        { size_code: "scr", path: "/path/screen.jpg" },
        { size_code: "orig", path: "/path/original.jpg" },
      ] as any;

      const result = service.validateFileTypes(files, requiredSizes);

      expect(result).toBe(true); // Should still return true as all required types are present
    });
  });

  describe("formDataToBuffer", () => {
    it("should convert FormData to Buffer successfully", async () => {
      const mockFormData = new FormData();
      mockFormData.append("test", "data");

      const result = await service.formDataToBuffer(mockFormData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle FormData error events", async () => {
      const mockFormData = {
        on: vi.fn(),
        resume: vi.fn(),
      } as any;

      // Set up the mock to simulate an error
      mockFormData.on.mockImplementation(
        (event: string, callback: (error?: Error) => void) => {
          if (event === "error") {
            // Simulate an error being emitted
            setTimeout(() => callback(new Error("FormData error")), 0);
          }
        },
      );

      await expect(service.formDataToBuffer(mockFormData)).rejects.toThrow(
        "FormData error",
      );

      expect(mockFormData.on).toHaveBeenCalledWith(
        "data",
        expect.any(Function),
      );
      expect(mockFormData.on).toHaveBeenCalledWith("end", expect.any(Function));
      expect(mockFormData.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
      expect(mockFormData.resume).toHaveBeenCalled();
    });

    it("should handle non-Buffer chunks", async () => {
      const mockFormData = {
        on: vi.fn(),
        resume: vi.fn(),
      } as any;

      const testData = "test string data";

      mockFormData.on.mockImplementation(
        (event: string, callback: (chunk?: string) => void) => {
          if (event === "data") {
            // Simulate non-Buffer data being emitted
            setTimeout(() => callback(testData), 0);
          } else if (event === "end") {
            setTimeout(() => callback(), 10);
          }
        },
      );

      const result = await service.formDataToBuffer(mockFormData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe(testData);
    });

    it("should handle Buffer chunks", async () => {
      const mockFormData = {
        on: vi.fn(),
        resume: vi.fn(),
      } as any;

      const testBuffer = Buffer.from("test buffer data");

      mockFormData.on.mockImplementation(
        (event: string, callback: (chunk?: Buffer) => void) => {
          if (event === "data") {
            // Simulate Buffer data being emitted
            setTimeout(() => callback(testBuffer), 0);
          } else if (event === "end") {
            setTimeout(() => callback(), 10);
          }
        },
      );

      const result = await service.formDataToBuffer(mockFormData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe("test buffer data");
    });

    it("should handle multiple chunks of mixed types", async () => {
      const mockFormData = {
        on: vi.fn(),
        resume: vi.fn(),
      } as any;

      const stringChunk = "string ";
      const bufferChunk = Buffer.from("buffer ");
      const anotherStringChunk = "data";

      mockFormData.on.mockImplementation(
        (event: string, callback: (chunk?: string | Buffer) => void) => {
          if (event === "data") {
            // Simulate multiple chunks being emitted
            setTimeout(() => callback(stringChunk), 0);
            setTimeout(() => callback(bufferChunk), 5);
            setTimeout(() => callback(anotherStringChunk), 10);
          } else if (event === "end") {
            setTimeout(() => callback(), 15);
          }
        },
      );

      const result = await service.formDataToBuffer(mockFormData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe("string buffer data");
    });
  });
});
