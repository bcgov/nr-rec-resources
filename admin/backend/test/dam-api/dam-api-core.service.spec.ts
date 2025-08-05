import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DamApiCoreService } from "../../src/dam-api/dam-api-core.service";
import { DamApiHttpService } from "../../src/dam-api/dam-api-http.service";
import { DamApiUtilsService } from "../../src/dam-api/dam-api-utils.service";
import {
  DamApiConfig,
  DamErrors,
  DamFile,
} from "../../src/dam-api/dam-api.types";

describe("DamApiCoreService", () => {
  let service: DamApiCoreService;
  let mockHttpService: Partial<DamApiHttpService>;
  let mockUtilsService: Partial<DamApiUtilsService>;
  let mockConfig: DamApiConfig;

  beforeEach(async () => {
    mockHttpService = {
      makeRequest: vi.fn(),
      createValidationClient: vi.fn(),
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
        { size_code: "scr", path: "/path/screen.jpg" },
      ];

      // Mock getResourcePath to return files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(mockFiles);
      (mockUtilsService.validateFileTypes as any).mockReturnValue(true);

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

    it("should use validation client when files not ready on first try", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];
      const finalFiles: DamFile[] = [
        { size_code: "original", path: "/path/original.jpg" },
        { size_code: "thm", path: "/path/thumb.jpg" },
        { size_code: "scr", path: "/path/screen.jpg" },
      ];

      const mockValidationClient = {
        post: vi.fn().mockResolvedValue({ data: finalFiles }),
      };
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ "content-type": "multipart/form-data" }),
      } as any;

      // Mock getResourcePath to return insufficient files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(initialFiles);

      // Mock validation sequence: first false (insufficient), then true (sufficient)
      (mockUtilsService.validateFileTypes as any)
        .mockReturnValueOnce(false) // First validation fails
        .mockReturnValueOnce(true); // Second validation passes

      (mockHttpService.createValidationClient as any).mockReturnValue(
        mockValidationClient,
      );
      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);

      const result = await service.getResourcePathWithRetry(
        "resource-123",
        mockConfig,
      );

      expect(service.getResourcePath).toHaveBeenCalled();
      expect(mockHttpService.createValidationClient).toHaveBeenCalled();

      // Test that the validateStatus function was called correctly
      const postCall = mockValidationClient.post.mock.calls[0];
      expect(postCall).toBeDefined();
      const config = postCall![2];
      expect(config.validateStatus).toBeDefined();
      expect(config.validateStatus(400)).toBe(true); // Should return true for status < 500
      expect(config.validateStatus(500)).toBe(false); // Should return false for status >= 500

      expect(mockValidationClient.post).toHaveBeenCalledWith(
        mockConfig.damUrl,
        mockFormData,
        expect.objectContaining({
          headers: { "content-type": "multipart/form-data" },
          validateStatus: expect.any(Function),
        }),
      );
      expect(result).toEqual(finalFiles);
    });

    it("should throw timeout error when files not ready after validation", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];

      const mockValidationClient = {
        post: vi.fn().mockResolvedValue({ data: initialFiles }),
      };
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ "content-type": "multipart/form-data" }),
      } as any;

      // Mock getResourcePath to return insufficient files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(initialFiles);

      // Mock validation to always return false (insufficient files)
      (mockUtilsService.validateFileTypes as any).mockReturnValue(false);

      (mockHttpService.createValidationClient as any).mockReturnValue(
        mockValidationClient,
      );
      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);

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
    });

    it("should handle validation client errors", async () => {
      const initialFiles: DamFile[] = [
        { size_code: "thm", path: "/path/thumb.jpg" },
      ];

      const mockValidationClient = {
        post: vi.fn().mockRejectedValue(new Error("Validation request failed")),
      };
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ "content-type": "multipart/form-data" }),
      } as any;

      // Mock getResourcePath to return insufficient files
      vi.spyOn(service, "getResourcePath").mockResolvedValue(initialFiles);

      // Mock validation to return false (insufficient files)
      (mockUtilsService.validateFileTypes as any).mockReturnValue(false);

      (mockHttpService.createValidationClient as any).mockReturnValue(
        mockValidationClient,
      );
      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);

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
    });
  });
});
