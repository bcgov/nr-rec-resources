import {
  DamApiConfig,
  DamApiCoreService,
  DamApiHttpService,
  DamApiUtilsService,
  DamErrors,
  DamFile,
} from "@/dam-api";
import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock p-retry module
vi.mock("p-retry", () => ({
  default: vi.fn(),
}));

import pRetry from "p-retry";

describe("DamApiCoreService", () => {
  let service: DamApiCoreService;
  let mockHttpService: Partial<DamApiHttpService>;
  let mockUtilsService: Partial<DamApiUtilsService>;
  let mockConfig: DamApiConfig;

  beforeEach(async () => {
    mockHttpService = {
      makeRequest: vi.fn(),
    };

    mockUtilsService = {
      createFormData: vi.fn(),
      validateFileTypes: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamApiCoreService,
        {
          provide: DamApiHttpService,
          useValue: mockHttpService,
        },
        {
          provide: DamApiUtilsService,
          useValue: mockUtilsService,
        },
      ],
    }).compile();

    service = module.get<DamApiCoreService>(DamApiCoreService);

    // Reset p-retry mock
    vi.clearAllMocks();

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

  it("should instantiate with correct dependencies", () => {
    expect(service).toBeInstanceOf(DamApiCoreService);
    expect(service["httpService"]).toBeDefined();
    expect(service["utilsService"]).toBeDefined();
    expect(service["logger"]).toBeDefined();
  });

  describe("createResource", () => {
    it("should create PDF resource successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResourceId = "resource-123";

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(
        expectedResourceId,
      );

      const result = await service.createResource(
        "Test PDF",
        "pdf",
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "create_resource",
          metadata: JSON.stringify({ title: "Test PDF" }),
          resource_type: mockConfig.pdfResourceType,
          archive: 0,
        },
        mockConfig,
      );
      expect(mockHttpService.makeRequest).toHaveBeenCalledWith(
        mockConfig.damUrl,
        mockFormData,
      );
      expect(result).toBe(expectedResourceId);
    });

    it("should create image resource successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResourceId = "resource-456";

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(
        expectedResourceId,
      );

      const result = await service.createResource(
        "Test Image",
        "image",
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "create_resource",
          metadata: JSON.stringify({ title: "Test Image" }),
          resource_type: mockConfig.imageResourceType,
          archive: 0,
        },
        mockConfig,
      );
      expect(result).toBe(expectedResourceId);
    });

    it("should throw HttpException on error", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error("Network error");

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.createResource("Test", "pdf", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.createResource("Test", "pdf", mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_CREATING_RESOURCE,
        );
      }
    });
  });

  describe("getResourcePath", () => {
    it("should get resource path successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "orig", path: "/path/original.jpg" },
      ];

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedFiles);

      const result = await service.getResourcePath("resource-123", mockConfig);

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "get_resource_all_image_sizes",
          resource: "resource-123",
        },
        mockConfig,
      );
      expect(result).toEqual(expectedFiles);
    });

    it("should handle non-array result for logging", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const nonArrayResult = { message: "No files found" }; // Non-array result

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(nonArrayResult);

      const result = await service.getResourcePath("resource-123", mockConfig);

      expect(result).toEqual(nonArrayResult);
      // This test covers the "unknown" branch in the ternary operator on line 96
    });

    it("should throw HttpException on error", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error("Network error");

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.getResourcePath("resource-123", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePath("resource-123", mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_GETTING_RESOURCE_IMAGES,
        );
      }
    });
  });

  describe("addResourceToCollection", () => {
    it("should add PDF resource to collection successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.addResourceToCollection(
        "resource-123",
        "pdf",
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "add_resource_to_collection",
          resource: "resource-123",
          collection: mockConfig.pdfCollectionId,
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it("should add image resource to collection successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.addResourceToCollection(
        "resource-456",
        "image",
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "add_resource_to_collection",
          resource: "resource-456",
          collection: mockConfig.imageCollectionId,
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw HttpException on error", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error("Network error");

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.addResourceToCollection("resource-123", "pdf", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.addResourceToCollection(
          "resource-123",
          "pdf",
          mockConfig,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION,
        );
      }
    });
  });

  describe("uploadFile", () => {
    let mockFile: Express.Multer.File;

    beforeEach(() => {
      mockFile = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test-image-data"),
      } as Express.Multer.File;
    });

    it("should upload file successfully", async () => {
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ "content-type": "multipart/form-data" }),
      } as any;
      const expectedResult = { success: true, file_id: "file-123" };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.uploadFile(
        "resource-123",
        mockFile,
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "upload_multipart",
          ref: "resource-123",
          no_exif: 1,
          revert: 0,
        },
        mockConfig,
      );
      expect(mockFormData.append).toHaveBeenCalledWith(
        "file",
        expect.any(Object), // Stream
        {
          filename: mockFile.originalname,
          contentType: mockFile.mimetype,
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw HttpException on error", async () => {
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ "content-type": "multipart/form-data" }),
      } as any;
      const error = new Error("Upload failed");

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.uploadFile("resource-123", mockFile, mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.uploadFile("resource-123", mockFile, mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_UPLOADING_FILE,
        );
      }
    });
  });

  describe("deleteResource", () => {
    it("should delete resource successfully", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.deleteResource("resource-123", mockConfig);

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: "delete_resource",
          resource: "resource-123",
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw HttpException on error", async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error("Delete failed");

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.deleteResource("resource-123", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.deleteResource("resource-123", mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_DELETING_RESOURCE,
        );
      }
    });
  });

  describe("getResourcePathWithRetry", () => {
    it("should return files immediately if validation passes on first try", async () => {
      const mockFiles: DamFile[] = [
        { size_code: "original", path: "/path/original.jpg" },
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "col", path: "/path/col.jpg" },
        { size_code: "pre", path: "/path/preview.jpg" },
      ];

      // Mock getResourcePath to return files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(mockFiles);
      (mockUtilsService.validateFileTypes as any).mockReturnValue(true);

      // Mock p-retry to succeed on first attempt
      const mockPRetry = pRetry as any;
      mockPRetry.mockImplementation(async (fn: any) => {
        return await fn(1);
      });

      const result = await service.getResourcePathWithRetry(
        "resource-123",
        mockConfig,
      );

      expect(service.getResourcePath).toHaveBeenCalledWith(
        "resource-123",
        mockConfig,
      );
      expect(result).toEqual(mockFiles);
    });

    it("should retry when files not ready on first try", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];
      const finalFiles: DamFile[] = [
        { size_code: "original", path: "/path/original.jpg" },
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "col", path: "/path/col.jpg" },
        { size_code: "pre", path: "/path/preview.jpg" },
      ];

      // Mock getResourcePath to return different files on each call
      vi.spyOn(service, "getResourcePath")
        .mockResolvedValueOnce(initialFiles) // First call - insufficient files
        .mockResolvedValueOnce(finalFiles); // Second call - all files ready

      // Mock validation to fail first, then pass
      (mockUtilsService.validateFileTypes as any)
        .mockReturnValueOnce(false) // First validation fails
        .mockReturnValueOnce(true); // Second validation passes

      // Mock p-retry to simulate one retry then success
      const mockPRetry = pRetry as any;
      let attemptCount = 0;
      mockPRetry.mockImplementation(async (fn: any) => {
        // Simulate first attempt failing, second succeeding
        attemptCount++;
        if (attemptCount === 1) {
          try {
            return await fn(1);
          } catch {
            // First attempt fails, try again
            return await fn(2);
          }
        }
        return await fn(attemptCount);
      });

      const result = await service.getResourcePathWithRetry(
        "resource-123",
        mockConfig,
      );

      expect(service.getResourcePath).toHaveBeenCalledTimes(2);
      expect(result).toEqual(finalFiles);
    });

    it("should throw timeout error when files not ready after all retries", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];

      // Mock getResourcePath to always return insufficient files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(initialFiles);

      // Mock validation to always return false (insufficient files)
      (mockUtilsService.validateFileTypes as any).mockReturnValue(false);

      // Mock p-retry to simulate retries and eventual timeout
      const mockPRetry = pRetry as any;
      mockPRetry.mockImplementation(async (fn: any, options: any) => {
        // Simulate p-retry exhausting all retries with the specific error message
        const error = new Error("Required file variants not processed");
        const detailedError = Object.assign(error, {
          attemptNumber: options.retries + 1,
          retriesLeft: 0,
        });
        throw detailedError;
      });

      await expect(
        service.getResourcePathWithRetry("resource-123", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePathWithRetry("resource-123", mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
        );
        expect((err as HttpException).message).toContain(
          "File processing timeout",
        );
      }
    }, 5000); // Reduced timeout since we're mocking p-retry

    it("should handle getResourcePath errors during retry", async () => {
      // Mock getResourcePath to throw an error
      vi.spyOn(service, "getResourcePath").mockRejectedValue(
        new Error("Network error"),
      );

      // Mock p-retry to simulate error propagation
      const mockPRetry = pRetry as any;
      mockPRetry.mockImplementation(async (fn: any, options: any) => {
        // Try to execute the function and let it fail
        try {
          await fn(1);
        } catch {
          // Simulate p-retry giving up after retries
          const finalError = new Error("Network error");
          finalError.name = "AbortError";
          throw Object.assign(finalError, {
            attemptNumber: options.retries + 1,
            retriesLeft: 0,
          });
        }
      });

      await expect(
        service.getResourcePathWithRetry("resource-123", mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePathWithRetry("resource-123", mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_GETTING_RESOURCE_IMAGES,
        );
      }
    }, 5000); // Reduced timeout since we're mocking p-retry

    it("should execute onFailedAttempt callback during retries", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];

      // Mock getResourcePath to always return insufficient files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(initialFiles);

      // Mock validation to always return false (insufficient files)
      (mockUtilsService.validateFileTypes as any).mockReturnValue(false);

      // Create a custom p-retry mock that triggers onFailedAttempt callback
      (pRetry as any).mockImplementation(async (fn: any, options: any) => {
        // Simulate first failed attempt - trigger onFailedAttempt
        const error = new Error("Required file variants not processed");
        const failedAttemptError = Object.assign(error, {
          attemptNumber: 1,
          retriesLeft: 4,
          message: "Required file variants not processed",
        });

        // Call the onFailedAttempt callback directly
        if (options.onFailedAttempt) {
          options.onFailedAttempt(failedAttemptError);
        }

        // Then throw final error after all retries
        const finalError = Object.assign(error, {
          attemptNumber: 6,
          retriesLeft: 0,
        });
        throw finalError;
      });

      // Spy on logger.debug to verify onFailedAttempt callback execution
      const loggerDebugSpy = vi.spyOn(service["logger"], "debug");

      await expect(
        service.getResourcePathWithRetry("resource-123", mockConfig),
      ).rejects.toThrow(HttpException);

      // Verify the onFailedAttempt callback was executed and logged
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Attempt 1/"),
      );

      loggerDebugSpy.mockRestore();
    });
  });
});
