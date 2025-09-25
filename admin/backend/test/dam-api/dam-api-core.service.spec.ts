import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DamApiCoreService } from '../../src/dam-api/dam-api-core.service';
import { DamApiHttpService } from '../../src/dam-api/dam-api-http.service';
import { DamApiUtilsService } from '../../src/dam-api/dam-api-utils.service';
import {
  DamApiConfig,
  DamErrors,
  DamFile,
} from '../../src/dam-api/dam-api.types';
import { DamMetadataDto } from '@/dam-api/dto/dam-metadata.dto';

describe('DamApiCoreService', () => {
  let service: DamApiCoreService;
  let mockHttpService: Partial<DamApiHttpService>;
  let mockUtilsService: Partial<DamApiUtilsService>;
  let mockConfig: DamApiConfig;

  beforeEach(async () => {
    mockHttpService = {
      makeRequest: vi.fn(),
      makeRequestWithValidation: vi.fn(),
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

    vi.clearAllMocks();

    mockConfig = {
      damUrl: 'https://test-dam.example.com',
      privateKey: 'test-private-key',
      user: 'test-user',
      pdfCollectionId: 'pdf-123',
      imageCollectionId: 'image-123',
      pdfResourceType: 1,
      imageResourceType: 2,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should instantiate with correct dependencies', () => {
    expect(service).toBeInstanceOf(DamApiCoreService);
    expect(service['httpService']).toBeDefined();
    expect(service['utilsService']).toBeDefined();
    expect(service['logger']).toBeDefined();
  });

  describe('createResource', () => {
    it('should create PDF resource successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResourceId = 'resource-123';

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(
        expectedResourceId,
      );
      const metadata: DamMetadataDto = {
        title: 'Test PDF',
      };
      const result = await service.createResource(metadata, 'pdf', mockConfig);

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'create_resource',
          metadata: JSON.stringify(metadata),
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

    it('should create image resource successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResourceId = 'resource-456';

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(
        expectedResourceId,
      );

      const metadata: DamMetadataDto = {
        title: 'Test PDF',
      };

      const result = await service.createResource(
        metadata,
        'image',
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'create_resource',
          metadata: JSON.stringify(metadata),
          resource_type: mockConfig.imageResourceType,
          archive: 0,
        },
        mockConfig,
      );
      expect(result).toBe(expectedResourceId);
    });

    it('should throw HttpException on error', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error('Network error');
      const metadata: DamMetadataDto = {
        title: 'Test',
      };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.createResource(metadata, 'pdf', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.createResource(metadata, 'pdf', mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_CREATING_RESOURCE,
        );
      }
    });
  });

  describe('getResourcePath', () => {
    it('should get resource path successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedFiles: DamFile[] = [
        { size_code: 'thm', path: '/path/thumb.jpg' },
        { size_code: 'orig', path: '/path/original.jpg' },
      ];

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedFiles);

      const result = await service.getResourcePath('resource-123', mockConfig);

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'get_resource_all_image_sizes',
          resource: 'resource-123',
        },
        mockConfig,
      );
      expect(result).toEqual(expectedFiles);
    });

    it('should handle non-array result for logging', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const nonArrayResult = { message: 'No files found' }; // Non-array result

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(nonArrayResult);

      const result = await service.getResourcePath('resource-123', mockConfig);

      expect(result).toEqual(nonArrayResult);
      // This test covers the "unknown" branch in the ternary operator on line 96
    });

    it('should throw HttpException on error', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error('Network error');

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.getResourcePath('resource-123', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePath('resource-123', mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_GETTING_RESOURCE_IMAGES,
        );
      }
    });
  });

  describe('addResourceToCollection', () => {
    it('should add PDF resource to collection successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.addResourceToCollection(
        'resource-123',
        'pdf',
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'add_resource_to_collection',
          resource: 'resource-123',
          collection: mockConfig.pdfCollectionId,
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should add image resource to collection successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.addResourceToCollection(
        'resource-456',
        'image',
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'add_resource_to_collection',
          resource: 'resource-456',
          collection: mockConfig.imageCollectionId,
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException on error', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error('Network error');

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.addResourceToCollection('resource-123', 'pdf', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.addResourceToCollection(
          'resource-123',
          'pdf',
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

  describe('uploadFile', () => {
    let mockFile: Express.Multer.File;

    beforeEach(() => {
      mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;
    });

    it('should upload file successfully', async () => {
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ 'content-type': 'multipart/form-data' }),
      } as any;
      const expectedResult = { success: true, file_id: 'file-123' };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.uploadFile(
        'resource-123',
        mockFile,
        mockConfig,
      );

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'upload_multipart',
          ref: 'resource-123',
          no_exif: 1,
          revert: 0,
        },
        mockConfig,
      );
      expect(mockFormData.append).toHaveBeenCalledWith(
        'file',
        expect.any(Object), // Stream
        {
          filename: mockFile.originalname,
          contentType: mockFile.mimetype,
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException on error', async () => {
      const mockFormData = {
        append: vi.fn(),
        getHeaders: vi
          .fn()
          .mockReturnValue({ 'content-type': 'multipart/form-data' }),
      } as any;
      const error = new Error('Upload failed');

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.uploadFile('resource-123', mockFile, mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.uploadFile('resource-123', mockFile, mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_UPLOADING_FILE,
        );
      }
    });
  });

  describe('deleteResource', () => {
    it('should delete resource successfully', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const expectedResult = { success: true };

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockResolvedValue(expectedResult);

      const result = await service.deleteResource('resource-123', mockConfig);

      expect(mockUtilsService.createFormData).toHaveBeenCalledWith(
        {
          user: mockConfig.user,
          function: 'delete_resource',
          resource: 'resource-123',
        },
        mockConfig,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException on error', async () => {
      const mockFormData = { append: vi.fn() } as any;
      const error = new Error('Delete failed');

      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);
      (mockHttpService.makeRequest as any).mockRejectedValue(error);

      await expect(
        service.deleteResource('resource-123', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.deleteResource('resource-123', mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_DELETING_RESOURCE,
        );
      }
    });
  });

  describe('getResourcePathWithRetry', () => {
    it('should return files when validation passes', async () => {
      const mockFiles: DamFile[] = [
        { size_code: 'original', path: '/path/original.jpg' },
        { size_code: 'thm', path: '/path/thumb.jpg' },
        { size_code: 'col', path: '/path/col.jpg' },
        { size_code: 'pre', path: '/path/preview.jpg' },
      ];

      const mockFormData = { append: vi.fn() } as any;
      (mockUtilsService.createFormData as any).mockReturnValue(mockFormData);

      // Mock makeRequestWithValidation to return files
      (mockHttpService.makeRequestWithValidation as any).mockResolvedValue(
        mockFiles,
      );

      const result = await service.getResourcePathWithRetry(
        'resource-123',
        mockConfig,
      );

      expect(mockHttpService.makeRequestWithValidation).toHaveBeenCalledWith(
        mockConfig.damUrl,
        mockFormData,
        expect.any(Function), // validation function
      );
      expect(result).toEqual(mockFiles);
    });

    it('should throw file processing timeout error when validation fails', async () => {
      // Mock makeRequestWithValidation to throw error indicating validation failure
      const validationError = new Error('Custom validation failed');
      (mockHttpService.makeRequestWithValidation as any).mockRejectedValue(
        validationError,
      );

      await expect(
        service.getResourcePathWithRetry('resource-123', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePathWithRetry('resource-123', mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
        );
        expect((err as HttpException).message).toContain(
          'File processing timeout',
        );
      }
    });

    it('should throw generic error for non-validation failures', async () => {
      // Mock makeRequestWithValidation to throw a different error (network, auth, etc.)
      const networkError = new Error('Network error');
      (mockHttpService.makeRequestWithValidation as any).mockRejectedValue(
        networkError,
      );

      await expect(
        service.getResourcePathWithRetry('resource-123', mockConfig),
      ).rejects.toThrow(HttpException);

      try {
        await service.getResourcePathWithRetry('resource-123', mockConfig);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(
          DamErrors.ERR_GETTING_RESOURCE_IMAGES,
        );
        expect((err as HttpException).message).toContain(
          'Error getting dam resource path with retry',
        );
      }
    });

    it('should use correct validation function that checks file types', async () => {
      const mockFiles: DamFile[] = [
        { size_code: 'original', path: '/path/original.jpg' },
        { size_code: 'thm', path: '/path/thumb.jpg' },
      ];

      // Mock makeRequestWithValidation to capture the validation function
      let capturedValidationFunction: ((data: any) => boolean) | undefined;
      (mockHttpService.makeRequestWithValidation as any).mockImplementation(
        (url: string, formData: any, validateFn: (data: any) => boolean) => {
          capturedValidationFunction = validateFn;
          return Promise.resolve(mockFiles);
        },
      );

      // Mock the utils service validateFileTypes
      (mockUtilsService.validateFileTypes as any).mockReturnValue(true);

      await service.getResourcePathWithRetry('resource-123', mockConfig);

      // Verify that the validation function was captured
      expect(capturedValidationFunction).toBeDefined();

      // Test the validation function directly
      if (capturedValidationFunction) {
        const result = capturedValidationFunction(mockFiles);
        expect(result).toBe(true);
        expect(mockUtilsService.validateFileTypes).toHaveBeenCalledWith(
          mockFiles,
          ['original', 'thm', 'col', 'pre'],
        );
      }
    });
  });
});
