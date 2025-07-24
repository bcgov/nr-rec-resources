import {
  DamApiConfig,
  DamCollectionRequest,
  DamCreateResourceRequest,
  DamErrors,
  DamFile,
  DamResource,
  DamUploadFileRequest,
} from "@/dam-api";
import { describe, expect, it } from "vitest";

describe("DAM API Types", () => {
  describe("DamFile interface", () => {
    it("should have required size_code and path properties", () => {
      const damFile: DamFile = {
        size_code: "thm",
        path: "/path/to/file.jpg",
      };

      expect(damFile.size_code).toBe("thm");
      expect(damFile.path).toBe("/path/to/file.jpg");
    });

    it("should support optional properties", () => {
      const damFile: DamFile = {
        size_code: "orig",
        path: "/path/to/original.jpg",
        url: "https://example.com/file.jpg",
        width: 1920,
        height: 1080,
        file_size: 2048000,
      };

      expect(damFile.url).toBe("https://example.com/file.jpg");
      expect(damFile.width).toBe(1920);
      expect(damFile.height).toBe(1080);
      expect(damFile.file_size).toBe(2048000);
    });
  });

  describe("DamResource interface", () => {
    it("should have ref_id and files properties", () => {
      const damResource: DamResource = {
        ref_id: "12345",
        files: [
          {
            size_code: "thm",
            path: "/path/to/thumbnail.jpg",
          },
        ],
      };

      expect(damResource.ref_id).toBe("12345");
      expect(damResource.files).toHaveLength(1);
      expect(damResource.files[0]?.size_code).toBe("thm");
    });
  });

  describe("DamCreateResourceRequest interface", () => {
    it("should support pdf resource type", () => {
      const request: DamCreateResourceRequest = {
        title: "Test PDF Document",
        resourceType: "pdf",
      };

      expect(request.title).toBe("Test PDF Document");
      expect(request.resourceType).toBe("pdf");
    });

    it("should support image resource type", () => {
      const request: DamCreateResourceRequest = {
        title: "Test Image",
        resourceType: "image",
      };

      expect(request.title).toBe("Test Image");
      expect(request.resourceType).toBe("image");
    });
  });

  describe("DamUploadFileRequest interface", () => {
    it("should have ref and file properties", () => {
      const mockFile = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test"),
      } as Express.Multer.File;

      const request: DamUploadFileRequest = {
        ref: "12345",
        file: mockFile,
      };

      expect(request.ref).toBe("12345");
      expect(request.file.originalname).toBe("test.jpg");
    });
  });

  describe("DamCollectionRequest interface", () => {
    it("should support pdf collection type", () => {
      const request: DamCollectionRequest = {
        resource: "12345",
        collectionType: "pdf",
      };

      expect(request.resource).toBe("12345");
      expect(request.collectionType).toBe("pdf");
    });

    it("should support image collection type", () => {
      const request: DamCollectionRequest = {
        resource: "12345",
        collectionType: "image",
      };

      expect(request.resource).toBe("12345");
      expect(request.collectionType).toBe("image");
    });
  });

  describe("DamApiConfig interface", () => {
    it("should have all required configuration properties", () => {
      const config: DamApiConfig = {
        damUrl: "https://dam.example.com",
        privateKey: "test-private-key",
        user: "test-user",
        pdfCollectionId: "pdf-collection-123",
        imageCollectionId: "image-collection-123",
        pdfResourceType: 1,
        imageResourceType: 2,
      };

      expect(config.damUrl).toBe("https://dam.example.com");
      expect(config.privateKey).toBe("test-private-key");
      expect(config.user).toBe("test-user");
      expect(config.pdfCollectionId).toBe("pdf-collection-123");
      expect(config.imageCollectionId).toBe("image-collection-123");
      expect(config.pdfResourceType).toBe(1);
      expect(config.imageResourceType).toBe(2);
    });
  });

  describe("DamErrors enum", () => {
    it("should have all error codes defined", () => {
      expect(DamErrors.ERR_CREATING_RESOURCE).toBe(416);
      expect(DamErrors.ERR_GETTING_RESOURCE_IMAGES).toBe(417);
      expect(DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION).toBe(418);
      expect(DamErrors.ERR_UPLOADING_FILE).toBe(419);
      expect(DamErrors.ERR_DELETING_RESOURCE).toBe(420);
      expect(DamErrors.ERR_SERVICE_UNAVAILABLE).toBe(421);
      expect(DamErrors.ERR_INVALID_CONFIGURATION).toBe(422);
      expect(DamErrors.ERR_FILE_PROCESSING_TIMEOUT).toBe(423);
    });

    it("should have unique error codes", () => {
      const errorCodes = Object.values(DamErrors);
      const uniqueCodes = new Set(errorCodes);
      expect(uniqueCodes.size).toBe(errorCodes.length);
    });
  });
});
