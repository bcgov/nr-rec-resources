import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppConfigService } from "../../src/app-config/app-config.service";
import { DamApiCoreService } from "../../src/dam-api/dam-api-core.service";
import { DamApiService } from "../../src/dam-api/dam-api.service";

describe("DamApiService", () => {
  let service: DamApiService;
  let mockDamApiCoreService: any;
  let mockAppConfigService: any;

  beforeEach(async () => {
    // Create mock services
    mockDamApiCoreService = {
      createResource: vi.fn(),
      getResourcePath: vi.fn(),
      addResourceToCollection: vi.fn(),
      uploadFile: vi.fn(),
      deleteResource: vi.fn(),
      validateFile: vi.fn(),
      getResourceImagesSingleRequest: vi.fn(),
    };

    mockAppConfigService = {
      damUrl: "https://mock-dam-api.com",
      damPrivateKey: "mock-key",
      damUser: "mock-user",
      damRstPdfCollectionId: "pdf-collection-123",
      damRstImageCollectionId: "image-collection-456",
      damResourceTypePdf: "pdf-type",
      damResourceTypeImage: "image-type",
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamApiService,
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: DamApiCoreService,
          useValue: mockDamApiCoreService,
        },
      ],
    }).compile();

    service = module.get<DamApiService>(DamApiService);
  });

  describe("constructor", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });
  });

  describe("createResource", () => {
    it("should create a PDF resource successfully", async () => {
      const mockResponse = "12345";
      mockDamApiCoreService.createResource.mockResolvedValueOnce(mockResponse);

      const result = await service.createResource("Test Document", "pdf");

      expect(result).toBe("12345");
      expect(mockDamApiCoreService.createResource).toHaveBeenCalledWith(
        "Test Document",
        "pdf",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
          privateKey: "mock-key",
          user: "mock-user",
          pdfCollectionId: "pdf-collection-123",
          imageCollectionId: "image-collection-456",
          pdfResourceType: "pdf-type",
          imageResourceType: "image-type",
        }),
      );
    });

    it("should create an image resource successfully", async () => {
      const mockResponse = "67890";
      mockDamApiCoreService.createResource.mockResolvedValueOnce(mockResponse);

      const result = await service.createResource("Test Image", "image");

      expect(result).toBe("67890");
      expect(mockDamApiCoreService.createResource).toHaveBeenCalledWith(
        "Test Image",
        "image",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
          privateKey: "mock-key",
          user: "mock-user",
        }),
      );
    });

    it("should handle errors", async () => {
      mockDamApiCoreService.createResource.mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(
        service.createResource("Test Document", "pdf"),
      ).rejects.toThrow("Network error");
    });
  });

  describe("getResourcePath", () => {
    it("should get resource path successfully", async () => {
      const mockResponse = [
        { path: "/path/to/resource/thumb.jpg", type: "thumb" },
        { path: "/path/to/resource/preview.jpg", type: "preview" },
      ];
      mockDamApiCoreService.getResourcePath.mockResolvedValueOnce(mockResponse);

      const result = await service.getResourcePath("12345");

      expect(result).toEqual(mockResponse);
      expect(mockDamApiCoreService.getResourcePath).toHaveBeenCalledWith(
        "12345",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });

    it("should handle errors", async () => {
      mockDamApiCoreService.getResourcePath.mockRejectedValueOnce(
        new Error("Not found"),
      );

      await expect(service.getResourcePath("invalid-id")).rejects.toThrow(
        "Not found",
      );
    });
  });

  describe("addResourceToCollection", () => {
    it("should add resource to collection successfully", async () => {
      mockDamApiCoreService.addResourceToCollection.mockResolvedValueOnce(
        undefined,
      );

      await service.addResourceToCollection("12345", "pdf");

      expect(
        mockDamApiCoreService.addResourceToCollection,
      ).toHaveBeenCalledWith(
        "12345",
        "pdf",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake image data"),
      } as Express.Multer.File;

      mockDamApiCoreService.uploadFile.mockResolvedValueOnce(undefined);

      await service.uploadFile("12345", mockFile);

      expect(mockDamApiCoreService.uploadFile).toHaveBeenCalledWith(
        "12345",
        mockFile,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });
  });

  describe("deleteResource", () => {
    it("should delete resource successfully", async () => {
      mockDamApiCoreService.deleteResource.mockResolvedValueOnce(undefined);

      await service.deleteResource("12345");

      expect(mockDamApiCoreService.deleteResource).toHaveBeenCalledWith(
        "12345",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });
  });

  describe("getResourcePathWithRetry", () => {
    it("should get resource path with retry successfully", async () => {
      const mockResponse = [
        { path: "/path/to/resource/thumb.jpg", type: "thumb" },
        { path: "/path/to/resource/preview.jpg", type: "preview" },
      ];
      mockDamApiCoreService.getResourcePathWithRetry = vi
        .fn()
        .mockResolvedValueOnce(mockResponse);

      const result = await service.getResourcePathWithRetry("12345");

      expect(result).toEqual(mockResponse);
      expect(
        mockDamApiCoreService.getResourcePathWithRetry,
      ).toHaveBeenCalledWith(
        "12345",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });
  });

  // Workflow Operations Tests
  describe("createAndUploadDocument", () => {
    it("should create and upload document successfully", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 2048,
        buffer: Buffer.from("fake pdf data"),
      } as Express.Multer.File;

      const mockRefId = "doc-123";
      const mockFiles = [
        { path: "/path/to/doc/thumb.jpg", type: "thumb" },
        { path: "/path/to/doc/preview.jpg", type: "preview" },
      ];

      mockDamApiCoreService.createResource.mockResolvedValueOnce(mockRefId);
      mockDamApiCoreService.uploadFile.mockResolvedValueOnce(undefined);
      mockDamApiCoreService.addResourceToCollection.mockResolvedValueOnce(
        undefined,
      );
      mockDamApiCoreService.getResourcePath.mockResolvedValueOnce(mockFiles);

      const result = await service.createAndUploadDocument(
        "Test Document",
        mockFile,
      );

      expect(result).toEqual({ ref_id: mockRefId, files: mockFiles });
      expect(mockDamApiCoreService.createResource).toHaveBeenCalledWith(
        "Test Document",
        "pdf",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(mockDamApiCoreService.uploadFile).toHaveBeenCalledWith(
        mockRefId,
        mockFile,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(
        mockDamApiCoreService.addResourceToCollection,
      ).toHaveBeenCalledWith(
        mockRefId,
        "pdf",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(mockDamApiCoreService.getResourcePath).toHaveBeenCalledWith(
        mockRefId,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });

    it("should handle errors during document creation", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 2048,
        buffer: Buffer.from("fake pdf data"),
      } as Express.Multer.File;

      mockDamApiCoreService.createResource.mockRejectedValueOnce(
        new Error("Creation failed"),
      );

      await expect(
        service.createAndUploadDocument("Test Document", mockFile),
      ).rejects.toThrow("Creation failed");
    });
  });

  describe("createAndUploadImage", () => {
    it("should create and upload image successfully", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake image data"),
      } as Express.Multer.File;

      const mockRefId = "img-456";
      const mockFiles = [
        { path: "/path/to/img/thumb.jpg", type: "thumb" },
        { path: "/path/to/img/preview.jpg", type: "preview" },
      ];

      mockDamApiCoreService.createResource.mockResolvedValueOnce(mockRefId);
      mockDamApiCoreService.uploadFile.mockResolvedValueOnce(undefined);
      mockDamApiCoreService.addResourceToCollection.mockResolvedValueOnce(
        undefined,
      );
      mockDamApiCoreService.getResourcePath.mockResolvedValueOnce(mockFiles);

      const result = await service.createAndUploadImage("Test Image", mockFile);

      expect(result).toEqual({ ref_id: mockRefId, files: mockFiles });
      expect(mockDamApiCoreService.createResource).toHaveBeenCalledWith(
        "Test Image",
        "image",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(mockDamApiCoreService.uploadFile).toHaveBeenCalledWith(
        mockRefId,
        mockFile,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(
        mockDamApiCoreService.addResourceToCollection,
      ).toHaveBeenCalledWith(
        mockRefId,
        "image",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(mockDamApiCoreService.getResourcePath).toHaveBeenCalledWith(
        mockRefId,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });

    it("should handle errors during image creation", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake image data"),
      } as Express.Multer.File;

      mockDamApiCoreService.createResource.mockRejectedValueOnce(
        new Error("Image creation failed"),
      );

      await expect(
        service.createAndUploadImage("Test Image", mockFile),
      ).rejects.toThrow("Image creation failed");
    });
  });

  describe("createAndUploadImageWithRetry", () => {
    it("should create and upload image with retry successfully", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake image data"),
      } as Express.Multer.File;

      const mockRefId = "img-retry-789";
      const mockFiles = [
        { path: "/path/to/img/thumb.jpg", type: "thumb" },
        { path: "/path/to/img/preview.jpg", type: "preview" },
        { path: "/path/to/img/full.jpg", type: "full" },
      ];

      mockDamApiCoreService.createResource.mockResolvedValueOnce(mockRefId);
      mockDamApiCoreService.uploadFile.mockResolvedValueOnce(undefined);
      mockDamApiCoreService.addResourceToCollection.mockResolvedValueOnce(
        undefined,
      );
      mockDamApiCoreService.getResourcePathWithRetry = vi
        .fn()
        .mockResolvedValueOnce(mockFiles);

      const result = await service.createAndUploadImageWithRetry(
        "Test Image Retry",
        mockFile,
      );

      expect(result).toEqual({ ref_id: mockRefId, files: mockFiles });
      expect(mockDamApiCoreService.createResource).toHaveBeenCalledWith(
        "Test Image Retry",
        "image",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(mockDamApiCoreService.uploadFile).toHaveBeenCalledWith(
        mockRefId,
        mockFile,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(
        mockDamApiCoreService.addResourceToCollection,
      ).toHaveBeenCalledWith(
        mockRefId,
        "image",
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
      expect(
        mockDamApiCoreService.getResourcePathWithRetry,
      ).toHaveBeenCalledWith(
        mockRefId,
        expect.objectContaining({
          damUrl: "https://mock-dam-api.com/api/?",
        }),
      );
    });

    it("should handle errors during image creation with retry", async () => {
      const mockFile = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake image data"),
      } as Express.Multer.File;

      mockDamApiCoreService.createResource.mockRejectedValueOnce(
        new Error("Retry creation failed"),
      );

      await expect(
        service.createAndUploadImageWithRetry("Test Image Retry", mockFile),
      ).rejects.toThrow("Retry creation failed");
    });
  });
});
