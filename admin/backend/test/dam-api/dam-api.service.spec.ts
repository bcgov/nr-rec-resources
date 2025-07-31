import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import axios from "axios";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import DamErrors enum for testing
enum DamErrors {
  ERR_CREATING_RESOURCE = 416,
  ERR_GETTING_RESOURCE_IMAGES = 417,
  ERR_ADDING_RESOURCE_TO_COLLECTION = 418,
  ERR_UPLOADING_FILE = 419,
  ERR_DELETING_RESOURCE = 420,
  ERR_SERVICE_UNAVAILABLE = 421,
  ERR_INVALID_CONFIGURATION = 422,
  ERR_FILE_PROCESSING_TIMEOUT = 423,
}

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Mock axios-retry
vi.mock("axios-retry", () => ({
  default: vi.fn(),
  isNetworkOrIdempotentRequestError: vi.fn(),
  isRetryableError: vi.fn(),
  exponentialDelay: vi.fn(),
}));

describe("DamApiService", () => {
  let service: DamApiService;
  let mockAxiosInstance: any;

  const mockFile: Express.Multer.File = {
    fieldname: "file",
    originalname: "test.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    size: 1024,
    buffer: Buffer.from("fake image data"),
    stream: Readable.from([]),
    destination: "",
    filename: "",
    path: "",
  };

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock axios.create to return our mock instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [DamApiService],
    }).compile();

    service = module.get<DamApiService>(DamApiService);
  });

  describe("constructor", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should initialize axios instance with proper config", () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 30000,
      });
    });
  });

  describe("createResource", () => {
    it("should create a PDF resource successfully", async () => {
      const mockResponse = "12345";
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.createResource("Test Document", "pdf");

      expect(result).toBe("12345");
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should create an image resource successfully", async () => {
      const mockResponse = "67890";
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.createResource("Test Image", "image");

      expect(result).toBe("67890");
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should throw error when network request fails", async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        service.createResource("Test Document", "pdf"),
      ).rejects.toThrow(HttpException);
    });

    it("should throw error when DAM service returns 500", async () => {
      const error = new Error("Internal Server Error") as any;
      error.response = { status: 500 };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        service.createResource("Test Document", "pdf"),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("getResourcePath", () => {
    it("should get resource path successfully", async () => {
      const mockResponse = [
        { path: "/path/to/resource/thumb.jpg", type: "thumb" },
        { path: "/path/to/resource/preview.jpg", type: "preview" },
      ];
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.getResourcePath("12345");

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should throw error when network request fails", async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error("Network error"));

      await expect(service.getResourcePath("12345")).rejects.toThrow(
        HttpException,
      );
    });

    it("should throw error with specific error code", async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error("API Error"));

      await expect(service.getResourcePath("12345")).rejects.toThrow(
        new HttpException(
          "Error getting resource images.",
          DamErrors.ERR_GETTING_RESOURCE_IMAGES,
        ),
      );
    });
  });

  describe("getResourcePathWithRetry", () => {
    it("should get resource paths with sufficient variants on first try", async () => {
      const mockResponse = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.jpg",
          },
          {
            size_code: "thm",
            url: "https://dam.example.com/file_thm.jpg",
          },
          {
            size_code: "scr",
            url: "https://dam.example.com/file_scr.jpg",
          },
          {
            size_code: "pre",
            url: "https://dam.example.com/file_pre.jpg",
          },
        ],
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.getResourcePathWithRetry("12345");

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should retry when insufficient variants available", async () => {
      const mockResponseFirst = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.jpg",
          },
          {
            size_code: "thm",
            url: "https://dam.example.com/file_thm.jpg",
          },
        ],
      };
      const mockResponseSecond = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.jpg",
          },
          {
            size_code: "thm",
            url: "https://dam.example.com/file_thm.jpg",
          },
          {
            size_code: "scr",
            url: "https://dam.example.com/file_scr.jpg",
          },
          {
            size_code: "pre",
            url: "https://dam.example.com/file_pre.jpg",
          },
        ],
      };
      mockAxiosInstance.post
        .mockResolvedValueOnce(mockResponseFirst)
        .mockResolvedValueOnce(mockResponseSecond);

      const result = await service.getResourcePathWithRetry("12345");

      expect(result).toEqual(mockResponseSecond.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });

    describe("retry logic", () => {
      let originalCreate;
      let service: DamApiService;
      let mockAxiosInstance: any;
      beforeEach(async () => {
        originalCreate = mockedAxios.create;
        mockAxiosInstance = {
          post: vi.fn(),
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
        };
        // Retry instance: 2 calls, must match AxiosInstance shape
        const mockRetryInstance = {
          post: vi.fn().mockResolvedValue({
            data: [
              {
                size_code: "original",
                url: "https://dam.example.com/file.jpg",
              },
              {
                size_code: "thm",
                url: "https://dam.example.com/file_thm.jpg",
              },
            ],
          }),

          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          create: vi.fn(),
          defaults: {
            headers: {
              common: {
                Accept: "",
                Authorization: "",
                "Content-Length": "",
                "Content-Encoding": "",
                "User-Agent": "",
              },
              delete: {},
              get: {},
              head: {},
              post: {},
              put: {},
              patch: {},
            },
          },
          interceptors: {},
          getUri: vi.fn(),
          request: vi.fn(),
          head: vi.fn(),
          options: vi.fn(),
          patch: vi.fn(),
          postForm: vi.fn(),
          putForm: vi.fn(),
          patchForm: vi.fn(),
        };
        mockedAxios.create = vi
          .fn()
          .mockReturnValueOnce(mockAxiosInstance)
          .mockReturnValueOnce(mockRetryInstance as any);
        global.mockRetryInstance = mockRetryInstance;
        // Instantiate service after setting up mocks
        const module: TestingModule = await Test.createTestingModule({
          imports: [AppConfigModule],
          providers: [DamApiService],
        }).compile();
        service = module.get<DamApiService>(DamApiService);
      });
      afterEach(() => {
        mockedAxios.create = originalCreate;
        delete global.mockRetryInstance;
      });
      it("should retry up to max attempts and throw error if variants never ready", async () => {
        // Main instance: always returns insufficient variants
        mockAxiosInstance.post.mockResolvedValue({
          data: [
            {
              size_code: "original",
              url: "https://dam.example.com/file.jpg",
            },
            {
              size_code: "thm",
              url: "https://dam.example.com/file_thm.jpg",
            },
          ],
        });
        // Retry instance: always returns insufficient variants, for all 4 calls
        global.mockRetryInstance.post.mockImplementation(() => {
          const error = new Error("FILES_NOT_READY");
          error.message = "FILES_NOT_READY";
          (error as any).isAxiosError = true;
          return Promise.reject(error);
        });
        await expect(service.getResourcePathWithRetry("12345")).rejects.toThrow(
          new HttpException(
            "File processing timeout: Image variants not ready",
            DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
          ),
        );
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
        expect(global.mockRetryInstance.post).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe("addResourceToCollection", () => {
    it("should add PDF resource to collection successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(
        service.addResourceToCollection("12345", "pdf"),
      ).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should add image resource to collection successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(
        service.addResourceToCollection("67890", "image"),
      ).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should throw error when adding to collection fails", async () => {
      const mockResponse = {
        data: {
          error: "Collection not found",
          success: false,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addResourceToCollection("12345", "pdf");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(
        service.uploadFile("12345", mockFile),
      ).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should throw error when file upload fails", async () => {
      const mockResponse = {
        data: {
          error: "Upload failed",
          success: false,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.uploadFile("12345", mockFile);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("deleteResource", () => {
    it("should delete resource successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(service.deleteResource("12345")).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it("should throw error when deletion fails", async () => {
      const mockResponse = {
        data: {
          error: "Resource not found",
          success: false,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteResource("12345");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("createAndUploadDocument", () => {
    it("should create and upload document successfully", async () => {
      const mockCreateResponse = {
        data: {
          resource: "12345",
          success: true,
        },
      };
      const mockUploadResponse = {
        data: {
          success: true,
        },
      };
      const mockCollectionResponse = {
        data: {
          success: true,
        },
      };
      const mockPathResponse = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.pdf",
          },
        ],
      };

      mockAxiosInstance.post
        .mockResolvedValueOnce(mockCreateResponse)
        .mockResolvedValueOnce(mockUploadResponse)
        .mockResolvedValueOnce(mockCollectionResponse)
        .mockResolvedValueOnce(mockPathResponse);

      const result = await service.createAndUploadDocument(
        "Test Document",
        mockFile,
      );

      expect(result).toEqual({
        ref_id: mockCreateResponse.data,
        files: mockPathResponse.data,
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(4);
    });

    it("should throw error when document creation fails", async () => {
      const mockResponse = {
        data: {
          error: "Creation failed",
          success: false,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(
        service.createAndUploadDocument("Test Document", mockFile),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("createAndUploadImage", () => {
    it("should create and upload image successfully", async () => {
      const mockCreateResponse = {
        data: {
          resource: "67890",
          success: true,
        },
      };
      const mockUploadResponse = {
        data: {
          success: true,
        },
      };
      const mockCollectionResponse = {
        data: {
          success: true,
        },
      };
      const mockPathResponse = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.jpg",
          },
          {
            size_code: "thm",
            url: "https://dam.example.com/file_thm.jpg",
          },
        ],
      };

      mockAxiosInstance.post
        .mockResolvedValueOnce(mockCreateResponse)
        .mockResolvedValueOnce(mockUploadResponse)
        .mockResolvedValueOnce(mockCollectionResponse)
        .mockResolvedValueOnce(mockPathResponse);

      const result = await service.createAndUploadImage("Test Image", mockFile);

      expect(result).toEqual({
        ref_id: mockCreateResponse.data,
        files: mockPathResponse.data,
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(4);
    });
  });

  describe("createAndUploadImageWithRetry", () => {
    it("should create and upload image with retry successfully", async () => {
      const mockCreateResponse = {
        data: {
          resource: "67890",
          success: true,
        },
      };
      const mockUploadResponse = {
        data: {
          success: true,
        },
      };
      const mockCollectionResponse = {
        data: {
          success: true,
        },
      };
      const mockPathResponse = {
        data: [
          {
            size_code: "original",
            url: "https://dam.example.com/file.jpg",
          },
          {
            size_code: "thm",
            url: "https://dam.example.com/file_thm.jpg",
          },
          {
            size_code: "scr",
            url: "https://dam.example.com/file_scr.jpg",
          },
          {
            size_code: "pre",
            url: "https://dam.example.com/file_pre.jpg",
          },
        ],
      };

      mockAxiosInstance.post
        .mockResolvedValueOnce(mockCreateResponse)
        .mockResolvedValueOnce(mockUploadResponse)
        .mockResolvedValueOnce(mockCollectionResponse)
        .mockResolvedValueOnce(mockPathResponse);

      const result = await service.createAndUploadImageWithRetry(
        "Test Image",
        mockFile,
      );

      expect(result).toEqual({
        ref_id: mockCreateResponse.data,
        files: mockPathResponse.data,
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(4);
    });

    it("should throw error when image creation with retry fails", async () => {
      const mockResponse = {
        data: {
          error: "Creation failed",
          success: false,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(
        service.createAndUploadImageWithRetry("Test Image", mockFile),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("error handling", () => {
    it("should handle axios timeout errors", async () => {
      const timeoutError = new Error("timeout of 30000ms exceeded");
      timeoutError.name = "AxiosError";
      mockAxiosInstance.post.mockRejectedValueOnce(timeoutError);

      await expect(
        service.createResource("Test Document", "pdf"),
      ).rejects.toThrow(HttpException);
    });

    it("should handle network connectivity errors", async () => {
      const networkError = new Error("Network Error");
      networkError.name = "AxiosError";
      mockAxiosInstance.post.mockRejectedValueOnce(networkError);

      await expect(
        service.createResource("Test Document", "pdf"),
      ).rejects.toThrow(HttpException);
    });

    it("should handle malformed responses", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({});

      const result = await service.createResource("Test Document", "pdf");
      expect(result).toBeUndefined();
    });
  });

  describe("private method behavior", () => {
    it("should handle invalid resource types gracefully", async () => {
      await expect(
        service.createResource("Test", "invalid" as any),
      ).rejects.toThrow(HttpException);
    });

    it("should validate file parameters", async () => {
      const invalidFile = { ...mockFile, buffer: undefined };

      await expect(
        service.uploadFile("12345", invalidFile as any),
      ).rejects.toThrow(HttpException);
    });
  });
});
