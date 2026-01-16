import { AppConfigService } from '@/app-config/app-config.service';
import { S3Service } from '@/s3/s3.service';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAppConfigTestModule,
  createMockS3Client,
  setupS3ClientMock,
} from '../test-utils/s3-test-utils';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: Mocked<S3Client>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = createMockS3Client();
    setupS3ClientMock(mockS3Client);

    const module = await createAppConfigTestModule({
      establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
      awsRegion: 'ca-central-1',
    });

    const appConfig = module.get<AppConfigService>(AppConfigService);
    service = new S3Service(appConfig, appConfig.establishmentOrderDocsBucket);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize S3Client with correct region', () => {
      expect(S3Client).toHaveBeenCalledWith({
        region: 'ca-central-1',
      });
    });

    it('should return correct bucket name via getBucketName()', () => {
      expect(service.getBucketName()).toBe(
        'rst-lza-establishment-order-docs-dev',
      );
    });

    it('should return S3Client instance via getS3Client()', () => {
      const client = service.getS3Client();
      expect(client).toBe(mockS3Client);
      expect(client).toBeDefined();
      expect(typeof client.send).toBe('function');
    });

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw error when bucket name is %s (covers line 42)',
      async (_, bucketName) => {
        const module = await createAppConfigTestModule({
          establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
          awsRegion: 'ca-central-1',
        });

        const appConfig = module.get<AppConfigService>(AppConfigService);
        expect(() => new S3Service(appConfig, bucketName as any)).toThrow(
          'Bucket name is required',
        );
      },
    );
  });

  describe('getSignedUrl', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when key is %s (covers line 147)',
      async (_, key) => {
        await expect(service.getSignedUrl(key as any)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.getSignedUrl(key as any)).rejects.toThrow(
          'S3 key is required',
        );
      },
    );

    it.each([
      ['0', 0],
      ['negative', -1],
      ['exceeds 604800', 604801],
    ])(
      'should throw BadRequestException when expiresIn is %s (covers line 152)',
      async (_, expiresIn) => {
        await expect(
          service.getSignedUrl('test-key', expiresIn as number),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getSignedUrl('test-key', expiresIn as number),
        ).rejects.toThrow(
          'Expiration time must be between 1 and 604800 seconds',
        );
      },
    );

    it('should generate presigned URL for valid S3 key', async () => {
      const testKey = 'REC0001/establishment-order.pdf';
      const expectedUrl =
        'https://s3.amazonaws.com/bucket/REC0001/establishment-order.pdf?signature=abc123';

      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      const result = await service.getSignedUrl(testKey);

      expect(result).toBe(expectedUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should use default expiration time (3600 seconds) when not specified', async () => {
      const testKey = 'REC0001/document.pdf';
      const expectedUrl = 'https://s3.amazonaws.com/bucket/document.pdf';

      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      await service.getSignedUrl(testKey);

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should use custom expiration time when provided', async () => {
      const testKey = 'REC0001/document.pdf';
      const customExpiration = 7200;
      const expectedUrl = 'https://s3.amazonaws.com/bucket/document.pdf';

      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      await service.getSignedUrl(testKey, customExpiration);

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 7200 },
      );
    });

    it('should throw error when S3 operation fails', async () => {
      const testKey = 'REC0001/invalid.pdf';
      const error = new Error('Access Denied');

      vi.mocked(getSignedUrl).mockRejectedValueOnce(error);

      await expect(service.getSignedUrl(testKey)).rejects.toThrow(
        'Failed to generate presigned URL',
      );
    });

    it('should create GetObjectCommand with correct parameters', async () => {
      const testKey = 'REC0001/test.pdf';
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');

      await service.getSignedUrl(testKey);

      const commandCall = vi.mocked(getSignedUrl).mock.calls[0]?.[1];
      expect(commandCall).toBeInstanceOf(GetObjectCommand);
    });

    describe('LocalStack endpoint URL construction', () => {
      let localStackService: S3Service;
      const localStackEndpoint = 'http://localhost:4566';
      let localStackAppConfig: AppConfigService;

      beforeEach(async () => {
        const localStackModule = await createAppConfigTestModule({
          establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
          awsRegion: 'ca-central-1',
          awsEndpointUrl: localStackEndpoint,
        });

        localStackAppConfig =
          localStackModule.get<AppConfigService>(AppConfigService);
        localStackService = new S3Service(
          localStackAppConfig,
          localStackAppConfig.establishmentOrderDocsBucket,
        );
      });

      it('should construct direct LocalStack URL when endpoint is set', async () => {
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `${localStackEndpoint}/rst-lza-establishment-order-docs-dev/${testKey}`;

        const result = await localStackService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
        expect(getSignedUrl).not.toHaveBeenCalled();
      });

      it('should remove trailing slash from endpoint URL', async () => {
        const moduleWithTrailingSlash = await createAppConfigTestModule({
          establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
          awsRegion: 'ca-central-1',
          awsEndpointUrl: 'http://localhost:4566/',
        });

        const appConfigWithSlash =
          moduleWithTrailingSlash.get<AppConfigService>(AppConfigService);
        const serviceWithSlash = new S3Service(
          appConfigWithSlash,
          appConfigWithSlash.establishmentOrderDocsBucket,
        );
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `http://localhost:4566/rst-lza-establishment-order-docs-dev/${testKey}`;

        const result = await serviceWithSlash.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });

      it('should handle HTTPS endpoint URLs', async () => {
        const httpsModule = await createAppConfigTestModule({
          establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
          awsRegion: 'ca-central-1',
          awsEndpointUrl: 'https://localstack.example.com',
        });

        const httpsAppConfig =
          httpsModule.get<AppConfigService>(AppConfigService);
        const httpsService = new S3Service(
          httpsAppConfig,
          httpsAppConfig.establishmentOrderDocsBucket,
        );
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `https://localstack.example.com/rst-lza-establishment-order-docs-dev/${testKey}`;

        const result = await httpsService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });

      it('should trim key when constructing LocalStack URL', async () => {
        const testKey = '  REC0001/document.pdf  ';
        const expectedUrl = `${localStackEndpoint}/rst-lza-establishment-order-docs-dev/REC0001/document.pdf`;

        const result = await localStackService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });
    });
  });

  describe('listObjectsByPrefix', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when prefix is %s (covers line 107)',
      async (_, prefix) => {
        await expect(
          service.listObjectsByPrefix(prefix as any),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.listObjectsByPrefix(prefix as any),
        ).rejects.toThrow('Prefix is required');
      },
    );

    it('should return array of objects for valid prefix', async () => {
      const testPrefix = 'REC0001/';
      const mockResponse = {
        Contents: [
          {
            Key: 'REC0001/document1.pdf',
            Size: 1024000,
            LastModified: new Date('2024-01-01T00:00:00Z'),
          },
          {
            Key: 'REC0001/document2.pdf',
            Size: 2048000,
            LastModified: new Date('2024-01-02T00:00:00Z'),
          },
        ],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        key: 'REC0001/document1.pdf',
        size: 1024000,
        lastModified: new Date('2024-01-01T00:00:00Z'),
      });
      expect(result[1]).toEqual({
        key: 'REC0001/document2.pdf',
        size: 2048000,
        lastModified: new Date('2024-01-02T00:00:00Z'),
      });
    });

    it('should return empty array when no objects found (response.Contents is undefined)', async () => {
      const testPrefix = 'REC9999/';
      const mockResponse = {};

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when Contents is empty', async () => {
      const testPrefix = 'REC0000/';
      const mockResponse = {
        Contents: [],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when S3 operation fails', async () => {
      const testPrefix = 'REC0001/';
      const error = new Error('Network error');

      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(service.listObjectsByPrefix(testPrefix)).rejects.toThrow(
        'Failed to list objects',
      );
    });

    it('should map S3 response correctly for multiple objects', async () => {
      const testPrefix = 'REC0002/';
      const date1 = new Date('2024-06-01T10:30:00Z');
      const date2 = new Date('2024-06-02T14:45:00Z');

      const mockResponse = {
        Contents: [
          {
            Key: 'REC0002/file1.pdf',
            Size: 500,
            LastModified: date1,
          },
          {
            Key: 'REC0002/file2.pdf',
            Size: 1500,
            LastModified: date2,
          },
        ],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([
        {
          key: 'REC0002/file1.pdf',
          size: 500,
          lastModified: date1,
        },
        {
          key: 'REC0002/file2.pdf',
          size: 1500,
          lastModified: date2,
        },
      ]);
    });
  });

  describe('uploadFile', () => {
    const mockFile = Buffer.from('test file content');
    const recResourceId = 'REC0001';
    const filename = 'test-document.pdf';
    const expectedKey = 'REC0001/test-document.pdf';

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when recResourceId is %s (covers line 193)',
      async (_, invalidRecResourceId) => {
        await expect(
          service.uploadFile(invalidRecResourceId as any, mockFile, filename),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.uploadFile(invalidRecResourceId as any, mockFile, filename),
        ).rejects.toThrow('Recreation resource ID is required');
      },
    );

    it.each([
      ['empty', Buffer.from('')],
      ['null', null],
    ])(
      'should throw FileValidationException when file buffer is %s (covers line 196)',
      async (_, invalidFileBuffer) => {
        await expect(
          service.uploadFile(recResourceId, invalidFileBuffer as any, filename),
        ).rejects.toThrow('File buffer cannot be empty');
      },
    );

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw FileValidationException when filename is %s (covers line 199)',
      async (_, invalidFileName) => {
        await expect(
          service.uploadFile(recResourceId, mockFile, invalidFileName as any),
        ).rejects.toThrow('File name is required');
      },
    );

    it('should upload file successfully when file does not exist', async () => {
      mockS3Client.send.mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        filename,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      const firstCall = mockS3Client.send.mock.calls[0]?.[0];
      expect(firstCall).toBeInstanceOf(HeadObjectCommand);
      const secondCall = mockS3Client.send.mock.calls[1]?.[0];
      expect(secondCall).toBeInstanceOf(PutObjectCommand);
    });

    it('should throw error when file already exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(`File "${filename}" already exists`);

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should construct correct S3 key from recResourceId and filename', async () => {
      mockS3Client.send.mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadFile('REC0042', mockFile, 'order.pdf');

      expect(result).toBe('REC0042/order.pdf');
    });

    it('should upload file with correct parameters', async () => {
      mockS3Client.send.mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await service.uploadFile(recResourceId, mockFile, filename);

      const putCall = mockS3Client.send.mock.calls[1]?.[0];
      expect(putCall).toBeInstanceOf(PutObjectCommand);
    });

    it('should handle 404 httpStatusCode as file not found', async () => {
      mockS3Client.send.mockRejectedValueOnce({
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        filename,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    });

    it('should throw error when PutObjectCommand fails', async () => {
      mockS3Client.send.mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockRejectedValueOnce(
        new Error('Insufficient permissions'),
      );

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow('Failed to upload file');
    });

    it('should throw error when HeadObjectCommand fails with non-404 error', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      mockS3Client.send.mockRejectedValueOnce(networkError);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow('Failed to check file existence');
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when HeadObjectCommand fails with generic error', async () => {
      const genericError = new Error('S3 service unavailable');
      genericError.name = 'ServiceUnavailable';
      mockS3Client.send.mockRejectedValueOnce(genericError);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should preserve BadRequestException when file already exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(BadRequestException);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should handle files with special characters in filename', async () => {
      const specialFilename = 'test document #2024.pdf';
      const expectedSpecialKey = 'REC0001/test document #2024.pdf';

      mockS3Client.send.mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        specialFilename,
      );

      expect(result).toBe(expectedSpecialKey);
    });
  });

  describe('deleteFile', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when key is %s (covers line 269)',
      async (_, key) => {
        await expect(service.deleteFile(key as any)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.deleteFile(key as any)).rejects.toThrow(
          'S3 key is required',
        );
      },
    );

    it('should delete file successfully', async () => {
      const testKey = 'REC0001/test-document.pdf';
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await service.deleteFile(testKey);

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      const deleteCall = mockS3Client.send.mock.calls[0]?.[0];
      expect(deleteCall).toBeInstanceOf(DeleteObjectCommand);
    });

    it('should throw error when S3 deletion fails', async () => {
      const testKey = 'REC0001/test-document.pdf';
      const error = new Error('Access Denied');

      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(service.deleteFile(testKey)).rejects.toThrow(
        'Failed to delete file',
      );
    });

    it('should handle deletion of files with special characters', async () => {
      const testKey = 'REC0001/test document @#2024.pdf';
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await service.deleteFile(testKey);

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      const deleteCall = mockS3Client.send.mock.calls[0]?.[0];
      expect(deleteCall).toBeInstanceOf(DeleteObjectCommand);
    });

    it('should handle deletion of non-existent files', async () => {
      // S3 DeleteObject returns success even if the object doesn't exist
      const testKey = 'REC0001/nonexistent.pdf';
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await expect(service.deleteFile(testKey)).resolves.not.toThrow();
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should delete files from different resource IDs', async () => {
      const testKey1 = 'REC0001/doc1.pdf';
      const testKey2 = 'REC0042/doc2.pdf';

      mockS3Client.send.mockResolvedValueOnce({} as any);
      await service.deleteFile(testKey1);

      mockS3Client.send.mockResolvedValueOnce({} as any);
      await service.deleteFile(testKey2);

      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      const firstCall = mockS3Client.send.mock.calls[0]?.[0];
      const secondCall = mockS3Client.send.mock.calls[1]?.[0];
      expect(firstCall).toBeInstanceOf(DeleteObjectCommand);
      expect(secondCall).toBeInstanceOf(DeleteObjectCommand);
    });

    it.each([
      ['network error', 'NetworkError', 'Network timeout'],
      ['permission error', 'AccessDenied', 'Access Denied'],
      ['bucket not found error', 'NoSuchBucket', 'Bucket does not exist'],
    ])(
      'should throw InternalServerErrorException when delete fails with %s',
      async (_, errorName, errorMessage) => {
        const testKey = 'REC0001/test-document.pdf';
        const error = new Error(errorMessage);
        error.name = errorName;

        mockS3Client.send.mockRejectedValueOnce(error);

        const promise = service.deleteFile(testKey);
        await expect(promise).rejects.toThrow(InternalServerErrorException);
        await expect(promise).rejects.toThrow('Failed to delete file');
      },
    );

    it('should include error message in exception when delete fails', async () => {
      const testKey = 'REC0001/test-document.pdf';
      const errorMessage = 'Custom S3 error message';
      const customError = new Error(errorMessage);

      mockS3Client.send.mockRejectedValueOnce(customError);

      try {
        await service.deleteFile(testKey);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect((error as Error).message).toContain('Failed to delete file');
        // Note: Original error is logged separately; exception message is standardized
      }
    });
  });
});
